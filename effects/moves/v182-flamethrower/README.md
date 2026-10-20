# Flamethrower V182 — original 12-frame pixel spritesheet

- Status: playable opt-in preview, approved official V172 untouched.
- Preview: https://lulualcides-sys.github.io/Pok-mon-torre/?fire182=preview
- Official rollback: https://lulualcides-sys.github.io/Pok-mon-torre/
- Original source: generated in this conversation October 2026, quantized to pixel-art colors.
- Sprite PNG: sheet.png, 768 x 384, 4 columns x 3 rows, 192 x 128 cell, 12 frames.
- Frame timing: 12 FPS, frames 1-4 ignition, 5-8 repeat continuous stream, 9-12 fade.
- Uses only shared PixiJS/WebGL with nearest-neighbor texture. No Canvas2D, CSS or additional render loop.
- No changes to approved files, HP, burn, damage, energy, cooldown, save or battle progression.
- If loading/GPU fails, the previous native VFX remains visible.
- Research: https://bulbapedia.bulbagarden.net/wiki/Flamethrower_(move)
- Research: https://pokemondb.net/move/flamethrower
- The loop is tied to native hit confirmation. This preview requires user visual approval before promotion.
