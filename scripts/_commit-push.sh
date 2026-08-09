#!/bin/bash
cd /e/Project/Gadget-Wallet

git add -A
echo '=== STAGED ==='
git status --short | head -30

echo
echo '=== COMMIT ==='
git commit -m 'fix: route all /api/* paths to the catch-all function via vercel.json rewrite

Vercel'"'"'s builder compiles api/[...route].js into a single-segment route
(^/api/([^/]+)$), so multi-segment paths like /api/products/featured and
/api/auth/login returned a platform-level NOT_FOUND and never reached the
dispatcher. This fixes it two ways:

- Rename the dispatcher to api/[[...route]].js (optional catch-all).
- Add { "source": "/api/:path*", "destination": "/api/[[...route]]" } to
  vercel.json rewrites, which generates a true multi-segment route. Rewrites
  preserve req.url, so the dispatcher still parses the full path.

Validated: local vercel build emits the multi-segment route; 38/38 dispatcher
tests + 36/36 smoke checks pass. Also remove leftover diagnostic scripts and
refresh README/DEPLOY_TO_VERCEL.md with the rewrite note.' 2>&1 | grep -v 'LF will' | tail -3

echo
echo '=== PUSH ==='
git push origin master 2>&1 | grep -v 'LF will' | tail -3

echo
echo '=== HEAD ==='
git log --oneline -1
