#!/bin/bash
cd /e/Project/Gadget-Wallet

git add -A
echo '=== STAGED ==='
git status --short

git commit -m 'feat: profile photo upload (camera button → multipart → Supabase)

Users can now change their profile picture from the desktop like product
images: the avatar camera button opens a file picker, uploads via
multipart/form-data, and updates the avatar in place.

- api-handlers/profile/avatar.js: POST /api/profile/avatar (requireAuth,
  busboy parse, Supabase upload under products/avatars/{userId}/, DB update,
  old-avatar cleanup scoped to the avatars namespace)
- Register the route in api-handlers/_routes.js + dispatcher test
- apps/server profile.ts: matching local Hono POST /avatar route
- storage.ts: allow products/avatars/ paths in extractStoragePath
- OverviewSection: click-to-upload avatar with spinner, validation, toasts
- Docs: API reference + route count 54 → 55

Validated: 39/39 dispatcher tests, 36/36 smoke checks, client + server
typecheck, and a 6/6 end-to-end multipart upload test against both backends.' 2>&1 | grep -v 'LF will' | tail -2

git push origin master 2>&1 | grep -v 'LF will' | tail -2
echo '=== HEAD ==='
git log --oneline -1
rm -f scripts/_avatar-commit.sh
