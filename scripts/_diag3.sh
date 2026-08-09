#!/bin/bash
cd /e/Project/Gadget-Wallet
echo '=== FUNCTIONS CONFIG IN DEPLOYMENT ==='
node -e '
const fs = require("fs");
const s = fs.readFileSync("./._d.json", "utf8");
const j = s.indexOf("\"functions\"");
console.log(j > -1 ? s.slice(j - 100, j + 1200) : "no functions key");
'
echo
echo '=== BUILD THE ROUTES LOCALLY (vercel build) ==='
VERCEL_TOKEN=$(grep '^VERCEL_TOKEN=' .env | cut -d= -f2)
export VERCEL_TOKEN
bunx vercel build --yes 2>&1 | tail -8
echo '=== GENERATED .vercel/output/config.json ==='
cat .vercel/output/config.json 2>/dev/null | head -c 2000
