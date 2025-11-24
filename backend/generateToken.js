const jwt = require("jsonwebtoken");

const JWT_SECRET = "zaq1@WSX"; // lub process.env.JWT_SECRET
const token = jwt.sign(
  { userId: 18 }, // ID użytkownika
  JWT_SECRET,
  { expiresIn: "1y" }
);

console.log("New token:", token);
