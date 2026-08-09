#!/bin/bash
cd /e/Project/Gadget-Wallet
echo '---GIT TREE api/---'
git ls-tree HEAD api/
echo '---DEV LOG---'
cat /tmp/vercel-dev.log 2>/dev/null | head -25 || echo 'no dev log'
echo '---DISK---'
ls -b api/
