#!/bin/bash
echo '=== GITHUB api/ dir listing ==='
curl -s "https://api.github.com/repos/minhazexo/gadget-wallet/contents/api?ref=master" -H "Accept: application/vnd.github+json" | node -e '
let s = "";
process.stdin.on("data", (c) => (s += c));
process.stdin.on("end", () => {
  try {
    const j = JSON.parse(s);
    if (Array.isArray(j)) {
      for (const f of j) console.log("FILE:", JSON.stringify(f.name), "| type:", f.type);
    } else {
      console.log("RESPONSE:", s.slice(0, 500));
    }
  } catch (e) { console.log("RAW:", s.slice(0, 500)); }
});
'
echo
echo '=== GITHUB: verify exact file via git trees API ==='
curl -s "https://api.github.com/repos/minhazexo/gadget-wallet/git/trees/master?recursive=1" -H "Accept: application/vnd.github+json" | node -e '
let s = "";
process.stdin.on("data", (c) => (s += c));
process.stdin.on("end", () => {
  try {
    const j = JSON.parse(s);
    if (j.tree) {
      const api = j.tree.filter((t) => t.path.startsWith("api/"));
      for (const t of api.slice(0, 15)) console.log("TREE:", t.path, "| sha:", t.sha.slice(0, 8));
      console.log("api dir total:", api.length);
    } else {
      console.log("RESPONSE:", s.slice(0, 400));
    }
  } catch (e) { console.log("RAW:", s.slice(0, 400)); }
});
'
