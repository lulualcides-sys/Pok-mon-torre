#!/usr/bin/env bash
set -Eeuo pipefail
# Official LibreSprite 1.3 AppImage for Linux x86_64, pinned SHA256.
version="v1.3"
sha256="fd90bddda8135fe00f4a9a9c8c9ebd48f9b07e8782ab269be5c9efb1a851af30"
filename="libresprite-v1.3-linux-x86_64.AppImage"
url="https://github.com/LibreSprite/LibreSprite/releases/download/${version}/${filename}"
install_dir="${LIBRESPRITE_INSTALL_DIR:-$HOME/.cache/pokemon-torre/libresprite-v1.3}"
app_run="${install_dir}/squashfs-root/AppRun"
marker="${install_dir}/.verified-official-sha256"
mkdir -p "$install_dir"
if [[ -x "$app_run" && -f "$marker" && "$(cat "$marker")" == "$sha256" ]]; then
  echo "LibreSprite $version: pacote oficial restaurado do cache."
else
  echo "Baixando LibreSprite $version da origem oficial..."
  rm -rf "$install_dir/squashfs-root"
  bundle="$install_dir/$filename"
  curl --fail --location --retry 4 --retry-delay 3 --connect-timeout 20 --max-time 300 --proto '=https' --tlsv1.2 --silent --show-error "$url" --output "$bundle.part"
  printf '%s  %s\n' "$sha256" "$bundle.part" | sha256sum --check --status
  mv "$bundle.part" "$bundle"
  chmod +x "$bundle"
  echo "Extraindo AppImage sem FUSE e sem sudo..."
  ( cd "$install_dir" && "./$filename" --appimage-extract >/dev/null )
  test -x "$app_run" || { echo "::error::AppRun nao encontrado apos extracao"; exit 1; }
  printf '%s\n' "$sha256" > "$marker"
  rm -f "$bundle"
fi
export SDL_VIDEODRIVER=dummy
export LIBRESPRITE_BIN="$app_run"
version_output="$("$LIBRESPRITE_BIN" --version 2>&1)" || { echo "::error::LibreSprite nao iniciou: $version_output"; exit 1; }
printf 'Instalado: %s\n' "$version_output"
if [[ -n "${GITHUB_ENV:-}" ]]; then
  printf 'LIBRESPRITE_BIN=%s\n' "$app_run" >> "$GITHUB_ENV"
  printf 'SDL_VIDEODRIVER=dummy\n' >> "$GITHUB_ENV"
fi
