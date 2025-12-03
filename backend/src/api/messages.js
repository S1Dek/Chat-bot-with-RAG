const express = require("express");
const prisma = require("../prismaClient");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Łączenie z modelem
async function queryModel(prompt) {
    const modelUrl =
        process.env.MODEL_API_URL || "http://localhost:11434/api/generate";

    const res = await fetch(modelUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "serwisitchat",
            prompt,
            stream: false,
        }),
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error("Model error: " + txt);
    }

    const data = await res.json();
    return data.response;
}

// WIADOMOŚCI GOŚCIA
router.post("/guest", async(req, res) => {
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: "Brak treści" });

    try {
        const response = await queryModel(content);

        return res.json({
            id: "guest-" + Date.now(),
            sender: "assistant",
            content: response,
        });
    } catch (err) {
        console.error("Guest model error:", err);
        return res.status(500).json({ error: "Model request failed" });
    }
});

// WIADOMOŚCI ZALOGOWANEGO UŻYTKOWNIKA

router.post("/send", verifyToken, async(req, res) => {
    const { conversationId, content } = req.body;

    if (!conversationId || !content)
        return res.status(400).json({ error: "Brak danych" });

    try {
        await prisma.message.create({
            data: { conversationId, sender: "user", content },
        });

        // Odpowiedź modelu
        const output = await queryModel(content);

        const assistantMsg = await prisma.message.create({
            data: { conversationId, sender: "assistant", content: output },
        });

        return res.json(assistantMsg);
    } catch (err) {
        console.error("User model error:", err);
        return res.status(500).json({ error: "Model request failed" });
    }
});

module.exports = router;