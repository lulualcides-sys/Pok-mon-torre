# V136 — PIXEL-ART real / PixiJS WebGL / PixiJS Particle Emitter

**STATUS: prévia jogável; aguardando aprovação visual.** A V135 de Canvas 2D foi rejeitada. O usuário proibiu esse tipo de efeito. Quatro golpes foram refeitos inteiramente como **spritesheets pixel-art animados**, com quadros reais e contorno preto: Roost, Rajada (Gust), Air Slash e Bicada (Peck).

**Prévia no jogo:** https://lulualcides-sys.github.io/Pok-mon-torre/?flying136=pixel

**Sem Canvas 2D nesses golpes:** `runtime.js` nunca desenha linhas, formas ou polígonos; só intercepta o evento do ataque e chama `pixiFX.mountPixelFlying()`. A implementação em `effects/moves/_runtime/pixi-layer.js` reusa EXATAMENTE o WebGL Pixi existente na arena, texturas `PIXI.Texture` com `PIXI.SCALE_MODES.NEAREST`, e `PIXI.particles.Emitter` opcional com no máximo 12 pixels de apoio. O ticker já existente avança 12 ou 16 quadros do sprite atlas, sem criar segunda aplicação Pixi, canvas adicional ou outro requestAnimationFrame. O sistema destrói texturas de cena/emitter ao terminar o golpe ou batalha; texturas-base ficam em cache durante a sessão.

| Golpe | Frames | Spritesheet | Efeito |
|---|---:|---|---|
| Roost | 12 | `roost/spritesheet.png` | Asas pixeladas se recolhem, penas descem, recuperação nativa |
| Rajada | 16 | `gust/spritesheet.png` | Múltiplas faixas de vento pixelizadas em movimento |
| Air Slash | 16 | `air-slash/spritesheet.png` | Crescentes afiados pixelados, com bordas irregulares |
| Bicada | 12 | `peck/spritesheet.png` | Bico físico pontiagudo, contato e choque seco |

Cada pasta tem `meta.json`. O arquivo **`tools/build-v136-flying-pixel.py` é a fonte reproduzível da arte**. Na publicação do GitHub Pages, esse script gera os quatro spritesheets físicos no caminho acima e o PixiJS os carrega por URL. Os PNGs NÃO são imagens estáticas usadas como ataque: são um ATLAS de quadros únicos executados sequencialmente.

A arte pode ser aberta/refinada no **LibreSprite** com importação como sequência de quadros. **Limitação documentada:** não executei LibreSprite neste ambiente por indisponibilidade do binário; a etapa de desenho autoral foi realizada como pixel art programática em um script de construção, não com editor LibreSprite. Reproduzir com LibreSprite continua compatível. Nenhuma mudança em Pokémon, hit original V359, cura do Roost, energia, dano, recarga, progresso, arena, saves, marcas ✓ ou ataques anteriores.

**Não aprovar automaticamente.** O usuário deve testar a V136 visualmente antes de substituir os efeitos existentes no jogo normal. `?flying135=preview` continua como comparação V135 rejeitada, mas não é padrão e não deve ser promovida. O jogo normal permanece V134 até a aprovação. `?safe=1` mantém sem a camada V136.

Checks CI: `tools/test-v136-flying-art.py`, `tests/v136-flying-pixel.test.cjs`, regressões existentes e publicação GitHub Pages.
