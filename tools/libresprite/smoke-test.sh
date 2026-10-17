#!/usr/bin/env bash
set -Eeuo pipefail
binary="${LIBRESPRITE_BIN:-$HOME/.cache/pokemon-torre/libresprite-v1.3/squashfs-root/AppRun}"
source="effects/moves/v144-flying-original/atlas.png"
test -x "$binary" || { echo "::error::LibreSprite nao instalado"; exit 1; }
test -s "$source" || { echo "::error::Atlas de sprites do usuario ausente"; exit 1; }
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT
output="$tmpdir/v144-libre-export.png"
export SDL_VIDEODRIVER=dummy
export XDG_RUNTIME_DIR="${RUNNER_TEMP:-$tmpdir}"
"$binary" --version
echo "Importando sprite original e exportando via LibreSprite..."
timeout 90 "$binary" --batch "$source" --save-as "$output"
test -s "$output" || { echo "::error::LibreSprite nao exportou PNG"; exit 1; }
node - "$source" "$output" <<'NODE'
const fs=require('node:fs'),assert=require('node:assert/strict');
function size(file){
 const b=fs.readFileSync(file);
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 return [b.readUInt32BE(16),b.readUInt32BE(20)];
}
assert.deepEqual(size(process.argv[2]),[768,384]);
assert.deepEqual(size(process.argv[3]),[768,384]);
console.log('PASS: LibreSprite importou e exportou sprites reais 768x384 sem Python.');
NODE
