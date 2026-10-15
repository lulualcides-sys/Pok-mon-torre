# V86 — prévia de batalha dos quatro golpes do print

**Estado:** somente prévia em `?battle_preview=v86`, sem modificar o jogo oficial ou aprovar os golpes automaticamente.

## Pesquisa de referências antes de desenhar

- **Raízes Violentas**: nome do catálogo local (`catalog_raizesviolentas`, Planta/área/especial). Usa referência de **Frenzy Plant**: raízes de árvore enormes, marrons, espinhentas, brotando do chão próximo ao adversário e batendo nele (não um raio verde nem Chicote em Área). Fonte: https://bulbapedia.bulbagarden.net/wiki/Frenzy_Plant_(move).
- **Geada Persistente**: nome **próprio do catálogo local** (`catalog_geadapersistente`, Gelo/hazard/especial); não atribuir falsamente ao jogo oficial. Arte de campo: uma crosta de geada cresce e se mantém no chão ao redor do adversário, com placas, cristais e gelo persistente. Sem a aparência de raio congelante.
- **Sopro Congelante**: nome do catálogo local (`catalog_soprocongelante`, Gelo/bolt/especial). Referência em **Frost Breath**: sopro de ar gélido e cristais cintilantes direcionados do atacante ao defensor, não uma avalanche em área. Fonte: https://bulbapedia.bulbagarden.net/wiki/Frost_Breath_(move).
- **Chicote Duplo**: nome próprio do catálogo local (`catalog_chicoteduplo`, Planta/dash/especial). Referência em **Double Hit** (duas pancadas consecutivas) e **Vine Whip** (haste vegetal flexível que golpeia o inimigo): golpe alto e golpe baixo, duas ações visuais distintas. Referências: https://bulbapedia.bulbagarden.net/wiki/Double_Hit_(move) e https://bulbapedia.bulbagarden.net/wiki/Vine_Whip_(move).

As animações são interpretações visuais fiéis às referências, não sprites retirados diretamente de games protegidos. Não copiar imagens de terceiros sem autorização. As características **mecânicas** continuam aquelas do jogo Pokémon Torre; nenhuma lógica de dano/crítico/energia/cooldown foi modificada ou inventada para igualar às regras de outra geração.

## Estrutura e execução

- `tools/build-v86-four-reference.py`: autoriza 8 frames RGBA distintos por golpe, na pasta específica `effects/moves/{slug}/v86-preview/sprites/{slug}.webp`.
- `effects/moves/v86-preview/render.js`: sprites animados e pequenos partículas no PixiJS/WebGL, cena isolada, escala proporcional e descarte após um ataque.
- `effects/moves/_runtime/pixi-layer.js`: instala somente o golpe selecionado. Não interfere nos golpes já aprovados.
- `effects/moves/_runtime/end.js`: acompanha casts reais e desliga o antigo pintor **apenas na prévia V86**.
- `tests/test-v86-four-reference.cjs` + `tests/test-browser-boot.cjs`: valida originalidade, texturas, renderização e quatro golpes em combate real (incluindo alternância).

**Aprovação:** exigir avaliação visual do usuário no jogo antes de alterar a versão oficial. **Preservar** V84.2 (inclusive os bugs conhecidos que o usuário mandou congelar), Haze V85 e golpes anteriormente aprovados.
