#!/bin/bash
cd /e/Project/Gadget-Wallet
# Print the region around "routes" in the deployment JSON
node -e '
const fs = require("fs");
const s = fs.readFileSync("/tmp/d.json", "utf8");
const i = s.indexOf("\"routes\"");
if (i === -1) { console.log("no routes key"); process.exit(0); }
console.log(s.slice(i - 50, i + 2500));
' 2>&1 | head -60
