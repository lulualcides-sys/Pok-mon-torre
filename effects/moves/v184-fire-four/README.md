# V184 — Four faithfully distinct Fire attacks (Mewtwo Lv. 50)

**Playable battle preview:** https://lulualcides-sys.github.io/Pok-mon-torre/?fire184=preview

- Flame Wheel — 12 frames — burning ring attached to physical charge/contact. Never convert to a flying fireball.
- Inferno — 16 frames — columns of engulfing intense fire surrounding enemy. Not Inferno Overdrive.
- Ember — 8 frames — three compact flame tongues projected towards foe, tiny impact. Not Flamethrower.
- Eruption — 16 frames — jagged ground crack, towering volcanic magma fountains and falling debris. Not Explosion.

Each is an independent real 4-column, 192×128 RGBA sprite sheet exported by the **actual LibreSprite CLI** in GitHub Actions. The 32-bit RGBA `animation.aseprite` for every move is built by `tools/build-v184-four-fire.cjs` from reproducible authored individual pixels. No Canvas2D, SVG, CSS or Python. The sheets are loaded with `PIXI.SCALE_MODES.NEAREST` in the existing WebGL context. Distinct frames, dark pixel contours, few secondary embers, no redundant huge explosions.

**Safety:** `?fire184=preview` only; normal game, approved V172/V183/V177/V128 and other moves unchanged. No damage, energy, cooldown, burn, catch, AI, progression or save changes. A miss does not create a fabricated hit. When WebGL/atlas is unavailable, original move paint is retained.

**Official sources:** 
- https://bulbapedia.bulbagarden.net/wiki/Flame_Wheel_(move)
- https://bulbapedia.bulbagarden.net/wiki/Inferno_(move)
- https://bulbapedia.bulbagarden.net/wiki/Ember_(move)
- https://bulbapedia.bulbagarden.net/wiki/Eruption_(move)
- https://pokemondb.net/move/flame-wheel
- https://pokemondb.net/move/inferno
- https://pokemondb.net/move/ember
- https://pokemondb.net/move/eruption

**Visual approval:** pending for these four new effects. V183 Fire Blast was approved separately and is in the normal game.
