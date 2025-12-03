const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const authRoutes = require("./api/auth");
const convRoutes = require("./api/conversations");
const messageRoutes = require("./api/messages");
const adminRoutes = require("./api/admin");
const { verifyToken } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/conversations", verifyToken, convRoutes);
app.use("/api/messages", verifyToken, messageRoutes);
app.use("/api/admin", verifyToken, adminRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server running on", PORT));
