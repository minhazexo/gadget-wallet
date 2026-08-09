#!/bin/bash
cd /e/Project/Gadget-Wallet
echo '---.vercel/output tree---'
find .vercel/output -maxdepth 3 2>/dev/null | head -30
echo
echo '---config.json---'
cat .vercel/output/config.json 2>/dev/null | head -c 2000
echo
echo '---routes?---'
find .vercel/output -name '*.json' 2>/dev/null
