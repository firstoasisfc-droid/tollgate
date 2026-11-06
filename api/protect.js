// Vercel function: POST /api/protect
const { screen } = require("../lib/handlers");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const out = await screen("protect", req.body || {});
  res.status(out.status).json(out.json);
};
