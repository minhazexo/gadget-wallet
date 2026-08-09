#!/bin/bash
# Full content verification of the canonical production alias.
BASE="https://gadget-wallet-minhaz-er-team.vercel.app"
echo "=== 1-segment routes ==="
curl -s "$BASE/api/health"; echo
curl -s "$BASE/api/products?limit=1" | head -c 200; echo
echo
echo "=== 2-segment static routes ==="
curl -s "$BASE/api/products/featured" | head -c 150; echo
curl -s "$BASE/api/products/new-arrivals" | head -c 150; echo
curl -s "$BASE/api/categories/accessories" | head -c 150; echo
echo
echo "=== 2-segment param routes ==="
curl -s "$BASE/api/products/ipad-pro-m4-13-inch" | head -c 150; echo
curl -s "$BASE/api/products/by-id/$(curl -s "$BASE/api/products?limit=1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)" | head -c 150; echo
echo
echo "=== 3-segment param routes ==="
curl -s "$BASE/api/cart/sess-test-123" | head -c 150; echo
curl -s "$BASE/api/orders/user/test-user" | head -c 120; echo
echo
echo "=== POST JSON body (login wrong password = 401 expected) ==="
curl -s -X POST -H "Content-Type: application/json" -d '{"email":"admin@gadgetwallet.com","password":"wrongpass"}' "$BASE/api/auth/login"; echo
echo "=== POST cart add ==="
curl -s -X POST -H "Content-Type: application/json" -d '{"productId":"x","quantity":1,"sessionId":"sess-test-123"}' "$BASE/api/cart/add" | head -c 150; echo
echo
echo "=== 404 unknown path (dispatcher JSON, not platform) ==="
curl -s "$BASE/api/nonexistent"; echo
echo "=== SPA rewrite ==="
curl -s -o /dev/null -w "shop: %{http_code}\n" "$BASE/shop"
