#!/bin/bash
BASE="https://gadgetwallet.vercel.app"
echo '=== / (homepage) dpl-id ==='
curl -s -D /tmp/h.txt "$BASE/" -o /tmp/home.html
grep -io 'dpl-[a-zA-Z0-9]*' /tmp/home.html | head -2
grep -i 'x-vercel-id\|x-vercel-cache\|x-vercel-error' /tmp/h.txt
echo
echo '=== /api/products/featured 404 page dpl-id ==='
curl -s "$BASE/api/products/featured" -o /tmp/f.html
grep -io 'dpl-[a-zA-Z0-9]*' /tmp/f.html | head -2
grep -i 'NOT_FOUND\|bom1::' /tmp/f.html | head -2
echo
echo '=== /shop dpl-id ==='
curl -s "$BASE/shop" -o /tmp/s.html
grep -io 'dpl-[a-zA-Z0-9]*' /tmp/s.html | head -2
wc -c /tmp/s.html
echo
echo '=== homepage HTML title + asset name ==='
grep -o '<title>[^<]*</title>' /tmp/home.html | head -1
grep -o 'assets/index-[a-zA-Z0-9]*\.js' /tmp/home.html | head -1
echo
echo '=== verify: which alias targets does the OLD ERROR deployment have ==='
