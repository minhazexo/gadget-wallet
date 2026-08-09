#!/bin/bash
cd /e/Project/Gadget-Wallet
VERCEL_TOKEN=$(grep '^VERCEL_TOKEN=' .env | cut -d= -f2)
curl -s "https://api.vercel.com/v13/deployments/dpl_7W39msMYgny6bMJs8nRH8tjWDg3P" -H "Authorization: Bearer $VERCEL_TOKEN" > ._deploy.json
node -e '
const fs = require("fs");
const s = fs.readFileSync("./._deploy.json", "utf8");
const i = s.indexOf("\"routes\"");
console.log("routes key at:", i);
if (i > -1) console.log(s.slice(i - 80, i + 3000));
const j = s.indexOf("\"lambdas\"");
if (j > -1) console.log("\n--- LAMBDAS ---\n", s.slice(j - 80, j + 800));
'
rm -f ._deploy.json
