function verifyAdmin(req, res, next) {
  if (!req.userRole || req.userRole !== "admin") {
    return res.status(403).json({ error: "Tylko administrator ma dostęp" });
  }
  next();
}

module.exports = { verifyAdmin };
