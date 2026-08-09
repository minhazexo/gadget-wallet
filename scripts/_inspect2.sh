#!/bin/bash
cd /e/Project/Gadget-Wallet
echo '=== DEPLOYMENT JSON KEYS (dpl_7W39) ==='
grep -o '"[a-zA-Z]*":' /tmp/d.json | sort -u | head -30
echo
echo '=== ROUTES / LAMBDA HINTS ==='
grep -o '"[a-zA-Z]*Route[a-zA-Z]*":[^,]*' /tmp/d.json | head -5
grep -o '"[a-zA-Z]*Lambda[a-zA-Z]*":[^,]*' /tmp/d.json | head -5
echo
echo '=== SIZE / REGION ==='
grep -o '"size":[0-9]*\|"maxDuration":[0-9]*\|"regions":\[[^]]*\]\|"runtime":"[^"]*"' /tmp/d.json | head -6
echo
echo '=== GADGETWALLET.VERCEL.APP headers for /api/health (no -L) ==='
curl -s -o /dev/null -D - 'https://gadgetwallet.vercel.app/api/health' | grep -iE 'HTTP/|location|x-vercel' 
echo
echo '=== GADGETWALLET.VERCEL.APP headers for /api/products/featured (no -L) ==='
curl -s -o /dev/null -D - 'https://gadgetwallet.vercel.app/api/products/featured' | grep -iE 'HTTP/|location|x-vercel'
echo
echo '=== GADGETWALLET root HTML dpl-id ==='
curl -s 'https://gadgetwallet.vercel.app/' | grep -o 'dpl-[a-zA-Z0-9]*' | head -2
echo
echo '=== GADGETWALLET api/health body (exact) ==='
curl -s 'https://gadgetwallet.vercel.app/api/health'
echo
