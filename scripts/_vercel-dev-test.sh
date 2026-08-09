#!/bin/bash
cd /e/Project/Gadget-Wallet
export VERCEL_TOKEN=$(grep '^VERCEL_TOKEN=' .env | cut -d= -f2)
echo '=== START vercel dev on :3999 ==='
bunx vercel dev --listen 3999 > /tmp/vercel-dev.log 2>&1 &
VDEV_PID=$!
sleep 12
echo '--- DEV LOG ---'
head -20 /tmp/vercel-dev.log
echo
echo '=== TEST ROUTES ==='
for p in "/api/health" "/api/products?limit=1" "/api/products/featured" "/api/auth/login" "/api/cart/sess-x"; do
  code=$(curl -s -o /tmp/rd.out -w '%{http_code}' "http://localhost:3999$p")
  echo "$p -> $code | $(head -c 80 /tmp/rd.out | tr -d '\n')"
done
echo
echo '=== STOP ==='
kill $VDEV_PID 2>/dev/null
wait $VDEV_PID 2>/dev/null
echo done
