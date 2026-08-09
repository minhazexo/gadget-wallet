#!/bin/bash
cd /e/Project/Gadget-Wallet

rm -f scripts/_commit-push.sh scripts/_verify-deploy.sh
git add -A
git commit -m 'chore: remove temporary commit/verify scripts' 2>&1 | grep -v 'LF will' | tail -2
git push origin master 2>&1 | grep -v 'LF will' | tail -2
echo '=== HEAD ==='
git log --oneline -1
echo '=== STATUS ==='
git status --short | head -5
