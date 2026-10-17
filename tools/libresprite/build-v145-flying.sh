#!/usr/bin/env bash
set -Eeuo pipefail
# V145: export real 16-frame ASE animations via the official LibreSprite CLI.
bin="$HOME/.cache/pokemon-torre/libresprite-v1.3/squashfs-root/AppRun"
if [[ -v LIBRESPRITE_BIN ]]; then bin="$LIBRESPRITE_BIN"; fi
root="effects/moves/v145-flying-libresprite"
test -x "$bin" || { echo "::error::LibreSprite CLI missing"; exit 1; }
export SDL_VIDEODRIVER=dummy
"$bin" --version
for slug in bico-broca vendaval aerocorte pique; do
  dir="$root/$slug"
  test -s "$dir/animation.aseprite" || { echo "::error::Missing editable sprite: $slug"; exit 1; }
  "$bin" --batch "$dir/animation.aseprite" --sheet-type rows --sheet-width 1024 --sheet "$dir/sheet.png" --data "$dir/sheet.json"
  test -s "$dir/sheet.png" || { echo "::error::LibreSprite did not export $slug"; exit 1; }
  echo "PASS LibreSprite exported: $slug (16 editable frames)"
done
