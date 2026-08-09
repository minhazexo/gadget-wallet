#!/bin/bash
# Inspect the gadget-wallet deployment + routing to figure out why 2-segment
# API paths return platform NOT_FOUND while 1-segment ones work.
set -e
cd /e/Project/Gadget-Wallet
VERCEL_TOKEN=$(grep '^VERCEL_TOKEN=' .env | cut -d= -f2)

echo '=== DEPLOYMENT URL/ALIASES (dpl_7W39) ==='
curl -s "https://api.vercel.com/v13/deployments/dpl_7W39msMYgny6bMJs8nRH8tjWDg3P" -H "Authorization: Bearer $VERCEL_TOKEN" > /tmp/d.json
grep -o '"url":"[^"]*"' /tmp/d.json | head -3
echo
echo '=== ALIASES field ==='
grep -o '"aliases":\[[^]]*\]' /tmp/d.json | head -c 500
echo
echo '=== PROJECT SETTINGS ==='
curl -s "https://api.vercel.com/v9/projects/prj_ip4EODb5fgfaClFitwAnKXOcVVFX" -H "Authorization: Bearer $VERCEL_TOKEN" > /tmp/p.json
grep -o '"rootDirectory":"[^"]*"\|"framework":"[^"]*"\|"buildCommand":"[^"]*"\|"outputDirectory":"[^"]*"\|"installCommand":"[^"]*"' /tmp/p.json
echo
echo '=== PROJECT DOMAINS ==='
curl -s "https://api.vercel.com/v9/projects/prj_ip4EODb5fgfaClFitwAnKXOcVVFX/domains" -H "Authorization: Bearer $VERCEL_TOKEN" > /tmp/pd.json
grep -o '"name":"[^"]*"\|"gitBranch":"[^"]*"\|"projectId":"[^"]*"' /tmp/pd.json | head -8
echo
echo '=== TEST: alias gadget-wallet-minhaz-er-team.vercel.app ==='
BASE="https://gadget-wallet-minhaz-er-team.vercel.app"
for p in "/api/health" "/api/products?limit=1" "/api/products/featured" "/api/auth/login"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -L "$BASE$p")
  echo "$p -> $code"
done
echo
echo '=== TEST: unique deployment URL dpl_7W39 ==='
BASE2="https://gadget-wallet-f1x7hop95-minhaz-er-team.vercel.app"
for p in "/api/health" "/api/products?limit=1" "/api/products/featured"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -L "$BASE2$p")
  echo "$p -> $code"
done
