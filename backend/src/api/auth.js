const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");
const { verifyToken } = require("../middleware/auth"); 
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

router.post("/register", async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Brak danych" });

  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: role || "user" },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "365d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Użytkownik już istnieje" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(401).json({ error: "Nieprawidłowe dane" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Nieprawidłowe dane" });

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "12h",
  });

  await prisma.session.create({
    data: { userId: user.id, ip: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    res.json(user);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});


router.patch("/update", verifyToken, async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const data = {};

    if (email) data.email = email;
    if (name) data.name = name;

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      data.password = hashed;
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data
    });

    return res.json({
      message: "Profil zaktualizowany",
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role
      }
    });

  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Nie udało się zaktualizować danych" });
  }
});

router.patch("/change-password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Brak danych" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!user) {
    return res.status(404).json({ error: "Użytkownik nie istnieje" });
  }

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    return res.status(400).json({ error: "Nieprawidłowe aktualne hasło" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: req.userId },
    data: { password: hashed },
  });

  res.json({ success: true });
});


module.exports = router;
