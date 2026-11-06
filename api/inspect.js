// Vercel function: POST /api/inspect
const { screen } = require("../lib/handlers");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const out = await screen("inspect", req.body || {});
  res.status(out.status).json(out.json);
};
