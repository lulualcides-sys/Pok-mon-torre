#!/usr/bin/env bash
set -Eeuo pipefail
export SDL_VIDEODRIVER=dummy
bin="${LIBRESPRITE_BIN:-$HOME/.cache/pokemon-torre/libresprite-v1.3/squashfs-root/AppRun}"
test -x "$bin" || { echo "LibreSprite is required for V187 export"; exit 1; }
node tools/build-v187-rea-fire-art.cjs
root="effects/moves/v187-rea-handdrawn-fire"
for type in flamethrower fireblast impact; do
 case "$type" in
  flamethrower) w=112; h=64;;
  fireblast) w=53; h=53;;
  impact) w=112; h=112;;
 esac
 dir="$root/$type"
 test -s "$dir/animation.aseprite"
 "$bin" --batch "$dir/animation.aseprite" --sheet-type rows --sheet-width "$((w*8))" --sheet "$dir/sheet.png" --data "$dir/sheet.json"
 test -s "$dir/sheet.png"
 node - "$dir/sheet.png" "$((w*8))" "$((h*2))" <<'NODE'
const fs=require('node:fs'),assert=require('node:assert/strict');
const b=fs.readFileSync(process.argv[2]);
assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(b.readUInt32BE(16),+process.argv[3]);
assert.equal(b.readUInt32BE(20),+process.argv[4]);
assert.ok(b.length>500,'Empty sprite atlas');
NODE
 echo "PASS LibreSprite $type: 16 original frames, source editable and PNG export"
done
