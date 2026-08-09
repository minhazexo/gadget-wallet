#!/bin/bash
cd /e/Project/Gadget-Wallet
VERCEL_TOKEN=$(grep '^VERCEL_TOKEN=' .env | cut -d= -f2)

curl -s "https://api.vercel.com/v13/deployments/dpl_7W39msMYgny6bMJs8nRH8tjWDg3P" -H "Authorization: Bearer $VERCEL_TOKEN" > /tmp/d.json
bun -e '
const d = JSON.parse(require("fs").readFileSync("/tmp/d.json", "utf8"));
console.log("has routes:", "routes" in d);
console.log("has builds:", "builds" in d);
console.log("has lambdas:", "lambdas" in d);
console.log("keys sample:", Object.keys(d).slice(0, 30).join(", "));
if (d.routes) {
  console.log("ROUTES COUNT:", d.routes.length);
  for (const r of d.routes.slice(0, 30)) console.log("ROUTE:", JSON.stringify(r));
}
' 2>&1 | head -50
