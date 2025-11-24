const express = require("express");
const prisma = require("../prismaClient");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/send", verifyToken, async(req, res) => {
    const { conversationId, content } = req.body;

    if (!content) return res.status(400).json({ error: "No content" });

    // sprawdzenie usera
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (user.role === "demo") {
        return res.json({
            sender: "assistant",
            content: "Tryb DEMO — wiadomość nie została wysłana do modelu.",
        });
    }

    // zapis wiadomości użytkownika
    await prisma.message.create({
        data: { conversationId, sender: "user", content },
    });

    // ------------- OLLAMA STREAM -------------
    const modelUrl = "http://localhost:11434/api/generate";

    try {
        const response = await fetch(modelUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "serwisitchat",
                prompt: content,
            }),
        });

        if (!response.ok) {
            throw new Error("Model returned error: " + response.status);
        }

        // Odbieranie STREAM-u linia po linii
        let assistantText = "";

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);

            // odpowiedź ollamy może zawierać wiele JSON-ów oddzielonych newline
            const lines = chunk.split("\n").filter((x) => x.trim() !== "");

            for (const line of lines) {
                try {
                    const json = JSON.parse(line);

                    if (json.response) {
                        assistantText += json.response;
                    }
                } catch (e) {
                    console.error("Stream JSON parse fail:", line);
                }
            }
        }

        // zapis odpowiedzi modelu
        const assistantMsg = await prisma.message.create({
            data: {
                conversationId,
                sender: "assistant",
                content: assistantText,
            },
        });

        return res.json(assistantMsg);
    } catch (err) {
        console.error("Model request failed:", err);
        return res.status(500).json({
            error: "Ollama request failed",
            detail: err.message,
        });
    }
});

module.exports = router;