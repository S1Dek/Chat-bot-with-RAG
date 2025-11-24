const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async(req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "Brak danych" });

    const hashed = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: { email, password: hashed, name },
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "365d",
        });

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: "Użytkownik już istnieje" });
    }
});

router.get("/me", verifyToken, async(req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
    });
    res.json(user);
});

router.post("/login", async(req, res) => {
    const { email, password } = req.body;

    let ok = false;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(401).json({ error: "Nieprawidłowe dane" });

    if (user.password === "") {
        ok = password === user.password;
    } else {
        ok = await bcrypt.compare(password, user.password);
    }

    if (!ok) return res.status(401).json({ error: "Nieprawidłowe dane" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    await prisma.session.create({
        data: {
            userId: user.id,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        },
    });

    res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
    });
});

module.exports = router;