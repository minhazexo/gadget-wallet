/** GET /api/health — deployment liveness check. */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  return res
    .status(200)
    .json({ success: true, message: "Gadget Wallet API is running" });
}
