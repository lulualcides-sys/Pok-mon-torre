# Chicotes em Área — V83 prévia experimental

Três vinhas surgem do solo, varrem a área e atingem no quadro 6/8.

- O spritesheet transparente de 3840 × 240 px, 8 células 480 × 240, é gerado por `python tools/build-v83-vine-whip.py` no destino `sprites/chicotes-em-area.webp`.
- Fonte vetorial: sprites existentes em `effects/moves/chicote-de-vinha/assets/`. Cada quadro é uma composição RGBA independente, feita offline com Pillow/CairoSVG.
- Reprodução em batalha real via PixiJS `effects/moves/v83-preview/render.js`, exclusivamente com `?battle_preview=v83`.
- Efeito de folhas: `@pixi/particle-emitter`. O desenho principal nunca usa Canvas 2D, CSS ou vídeo.
- Acerto e HP somente no quadro de impacto acima, usando o registro de hit original (sem cópia de dano).
- **Não aprovado / Não aplicado à batalha oficial**. Preservar todos os golpes aprovados e a V82.
