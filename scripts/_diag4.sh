#!/bin/bash
cd /e/Project/Gadget-Wallet
export VERCEL_TOKEN=$(grep '^VERCEL_TOKEN=' .env | cut -d= -f2)

echo '=== DEPLOYMENT FULL ROUTES/BUILDS ==='
curl -s "https://api.vercel.com/v13/deployments/dpl_7W39msMYgny6bMJs8nRH8tjWDg3P" -H "Authorization: Bearer $VERCEL_TOKEN" > _d.json
node -e '
const fs = require("fs");
const s = fs.readFileSync("./_d.json", "utf8");
try {
  const d = JSON.parse(s);
  console.log("routes:", JSON.stringify(d.routes, null, 1).slice(0, 800));
  console.log("builds count:", (d.builds || []).length);
  for (const b of (d.builds || []).slice(0, 10)) {
    console.log("BUILD:", b.use, "| src:", b.src, "| config:", JSON.stringify(b.config || {}).slice(0, 200));
  }
} catch (e) { console.log("parse error", e.message); }
'
rm -f _d.json
