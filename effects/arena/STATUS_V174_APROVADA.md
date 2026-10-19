# V174.2 — arenas regionais APROVADAS (19/10/2026)

**Autorização do usuário:** "Tá bom salva", após testar a prévia regional V174.

## Versão oficial

- As oito arenas pixel-art regionais foram aprovadas e integram `index.html`, na URL normal `https://lulualcides-sys.github.io/Pok-mon-torre/`.
- Cenário conforme a região: **Pewter/Brock (pedra); Cerulean/Misty (água); Vermilion/Lt. Surge (elétrico); Celadon/Erika (planta); Fuchsia/Koga (veneno); Saffron/Sabrina (psíquico); Cinnabar/Blaine (fogo); Viridian/Giovanni (terra)**.
- **Três variações** para treinadores em cada ginásio, selecionadas por etapa, e **uma versão própria para o líder** quando ele é alcançado (13, 15, 17... treinadores conforme o ginásio).
- Arte pixel de tiles e adereços construída pelo `PIXI.Graphics`; rasterização de cada cenário via `renderer.extract.base64` assíncrono no renderizador PixiJS WebGL **já existente**. Cenário fica em cache para evitar recriação por quadro. Renderiza atrás de todos os atores no campo de batalha existente. Sem Three.js, sem um segundo contexto WebGL.
- **Não tocar na progressão, arena física/hitboxes, capturas, pokébolas, danos, save, sprites Pokémon PMD, efeitos de golpes nem no arquivo `effects/moves/STATUS_APROVADOS.json`**.
- Arena aprovada deve permanecer preservada nas próximas mudanças, salvo solicitação expressa do usuário.
- V173 3D pesada continua **reprovada** e isolada; nunca promover automaticamente.
- Reversão isolada `?arena174=0`; modo seguro `?safe=1`; outros `arena_lab=` continuam com suas prévias independentes.
- Diagnóstico `PokemonTorreV174Regional.diagnostics()`, conferindo `enabled`, `approved`, `official`, `region`, `leader`, `generated`, `applied`, `errors`.
- Referência aprovada anterior: `torre-v174-light-2p5d-lab.html`, mantida para comparação; **não alterar** seu isolamento de `localStorage`.
- Validar sintaxe, regressões e batalha no Chrome Android/viewport mobile via `tests/v174-regional-pixel.test.cjs` e `tests/v174-approved-official-browser.cjs` antes de dizer que atualizações futuras estão prontas.
