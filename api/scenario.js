// Vercel function: GET /api/scenario (inputs) and POST /api/scenario (run all three gates)
const { scenario, SCENARIO } = require("../lib/handlers");
module.exports = async (req, res) => {
  if (req.method === "GET") return res.status(200).json(SCENARIO);
  if (req.method !== "POST") return res.status(405).json({ error: "Use GET or POST." });
  const out = await scenario(req.body || {});
  res.status(out.status).json(out.json);
};
