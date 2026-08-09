#!/bin/bash
BASE="https://gadgetwallet.vercel.app"
test_path() {
  local label="$1" path="$2" method="${3:-GET}" body="$4"
  if [ "$method" = "POST" ]; then
    local out
    out=$(curl -s -w $'\n###%{http_code}###' -X POST -H "Content-Type: application/json" -d "$body" "$BASE$path")
  else
    local out
    out=$(curl -s -w $'\n###%{http_code}###' "$BASE$path")
  fi
  local code
  code=$(echo "$out" | grep -o '###[0-9]*###' | tail -1)
  local content
  content=$(echo "$out" | sed 's/###[0-9]*###$//' | head -c 140)
  echo "[$label] $path ($method) -> $code | $(echo "$content" | tr -d '\n')"
}

echo '=== 1-segment ==='
test_path "health"      "/api/health"
test_path "products"    "/api/products?limit=1"
test_path "categories"  "/api/categories"
test_path "brands"      "/api/brands"
echo
echo '=== 2-segment static ==='
test_path "featured"    "/api/products/featured"
test_path "new-arr"    "/api/products/new-arrivals"
test_path "cat-slug"   "/api/categories/accessories"
test_path "brand-slug" "/api/brands/apple"
echo
echo '=== 2-segment param ==='
test_path "prod-slug"  "/api/products/ipad-pro-m4-13-inch"
test_path "reviews-user" "/api/reviews/user"
test_path "orders-user"  "/api/orders/user/whatever"
echo
echo '=== 3-segment ==='
test_path "cart-sess"  "/api/cart/sess-test-123"
test_path "cart-user"  "/api/cart/user/whatever"
test_path "addr-def"   "/api/address/x/default"
echo
echo '=== POST JSON ==='
test_path "login"    "/api/auth/login" POST '{"email":"admin@gadgetwallet.com","password":"wrongpass"}'
test_path "cart-add" "/api/cart/add" POST '{"productId":"x","quantity":1,"sessionId":"sess-test-123"}'
echo
echo '=== 404s ==='
test_path "unknown1" "/api/nonexistent"
test_path "unknown2" "/api/products/zzz-nope"
test_path "unknown3" "/api/a/b/c"
