const express = require("express");
const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const { verifyToken } = require("../middleware/auth");
const { verifyAdmin } = require("../middleware/admin");
const router = express.Router();

// GET WSZYSTKICH USERS
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
  });
  res.json(users);
});

// CREATE USER
router.post("/users", verifyToken, verifyAdmin, async (req, res) => {
  const { email, password, name, role } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role },
    });

    res.json(user);
  } catch (e) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// UPDATE ROLE / NAME
router.patch("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { role, name } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { role, name },
  });

  res.json(user);
});

// RESET PASSWORD
router.patch("/users/:id/reset", verifyToken, verifyAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const newPass = await bcrypt.hash("1234", 10);

  await prisma.user.update({
    where: { id },
    data: { password: newPass },
  });

  res.json({ success: true, newPassword: "1234" });
});

// DELETE USER
router.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const convs = await prisma.conversation.findMany({
      where: { userId: id },
    });

    const convIds = convs.map((c) => c.id);

    await prisma.message.deleteMany({
      where: { conversationId: { in: convIds } },
    });

    await prisma.conversation.deleteMany({
      where: { userId: id },
    });

    await prisma.session.deleteMany({
      where: { userId: id },
    });

    await prisma.user.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (e) {
    console.error("DELETE USER error:", e);
    res.status(500).json({ error: "Delete failed", detail: e.message });
  }
});

module.exports = router;
