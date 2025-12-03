const express = require("express");
const prisma = require("../prismaClient");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

router.get("/", async (req, res) => {
  const convs = await prisma.conversation.findMany({
    where: { userId: req.userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(convs);
});

router.post("/", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (user.role === "demo") {
    return res.json({
      id: "demo-temp-" + Date.now(),
      title: "Nowa rozmowa",
      messages: [],
    });
  }
  const { title } = req.body;
  const conv = await prisma.conversation.create({
    data: { title, userId: req.userId },
  });
  res.json(conv);
});
router.patch("/:id", async (req, res) => {
  const { title } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (user.role === "guest") {
    return res.status(403).json({ error: "Demo cannot rename conversations" });
  }

  const conv = await prisma.conversation.update({
    where: { id: Number(req.params.id) },
    data: { title },
  });

  res.json(conv);
});

router.delete("/:id", verifyToken, async (req, res) => {
  const id = Number(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });
  if (user.role === "demo") {
    return res.status(403).json({ error: "Demo nie może usuwać rozmów" });
  }

  try {
    await prisma.message.deleteMany({
      where: { conversationId: id },
    });
    await prisma.conversation.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (e) {
    console.error("Delete error:", e);
    res.status(400).json({ error: "Nie można usunąć rozmowy" });
  }
});

module.exports = router;
