#!/bin/bash
cd /e/Project/Gadget-Wallet
echo '=== GITHUB: does repo have api/[...route].js? ==='
curl -s "https://api.github.com/repos/minhazexo/gadget-wallet/contents/api" | grep -o '"name":"[^"]*"' | head -10
echo
echo '=== GITHUB: branch head sha ==='
curl -s "https://api.github.com/repos/minhazexo/gadget-wallet/commits/master" | grep -o '"sha":"[a-f0-9]*"' | head -1
echo
echo '=== LOCAL COMMIT ==='
git rev-parse HEAD
echo
echo '=== VERIFY: api-handlers/_routes.js exists on GitHub? ==='
curl -s "https://api.github.com/repos/minhazexo/gadget-wallet/contents/api-handlers" | grep -o '"name":"[^"]*"' | head -8
