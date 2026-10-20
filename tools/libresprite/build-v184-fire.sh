#!/usr/bin/env bash
set -Eeuo pipefail
export SDL_VIDEODRIVER=dummy
bin="$HOME/.cache/pokemon-torre/libresprite-v1.3/squashfs-root/AppRun"
test -x "$bin" || { echo 'LibreSprite CLI is required for V184'; exit 1; }
node tools/build-v184-four-fire.cjs
root=effects/moves/v184-fire-four
for entry in 'ember:8' 'flame-wheel:12' 'inferno:16' 'eruption:16'; do
 move="$(printf '%s' "$entry" | cut -d: -f1)"
 count="$(printf '%s' "$entry" | cut -d: -f2)"
 dir="$root/$move"
 test -s "$dir/animation.aseprite"
 "$bin" --batch "$dir/animation.aseprite" --sheet-type rows --sheet-width 768 --sheet "$dir/sheet.png"
 test -s "$dir/sheet.png"
 node - "$dir/sheet.png" "$count" <<'NODE'
const assert=require('node:assert/strict'),fs=require('node:fs');
const file=fs.readFileSync(process.argv[2]),frames=+process.argv[3];
assert.equal(file.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(file.readUInt32BE(16),768,'four columns of 192');
assert.equal(file.readUInt32BE(20),Math.ceil(frames/4)*128,'cell height 128');
assert.ok(file.length>500,'real frame sheet not a blank');
NODE
 echo "PASS LibreSprite V184 $move: $count frames in a playable PNG sprite sheet"
done
node tests/v184-four-fire.test.cjs
