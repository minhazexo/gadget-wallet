#!/bin/bash
cd /e/Project/Gadget-Wallet

git add -A
echo '=== STAGED ==='
git status --short

git commit -m 'feat: shared Avatar component + show user avatar in the header

Users now see their profile photo in the header: the desktop Account button,
the account dropdown, and the mobile menu drawer all render a circular avatar
(instead of a generic user icon). The profile page and sidebar use the same
component for consistent cropping.

- packages/ui/src/avatar.tsx: new Avatar component — absolute-positioned
  object-cover image that always fills the circle (never squished/offset),
  graceful initials fallback on empty src or load error, error state resets
  when src changes so a later upload always renders
- navbar: userAvatar prop wired into account button, dropdown, mobile drawer
- App: passes user?.avatar down
- OverviewSection + Profile sidebar: switch to the shared Avatar

Validated: client typecheck + production build pass.' 2>&1 | grep -v 'LF will' | tail -2

git push origin master 2>&1 | grep -v 'LF will' | tail -2
echo '=== HEAD ==='
git log --oneline -1
rm -f scripts/_avatar-commit.sh
