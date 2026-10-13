# Golpes animados — Mewtwo V35.81

Cada golpe mora em uma pasta própria, com código de animação independente:

- `psychic/index.js`: Psíquico — orbe de energia, anéis, deslocamento e impacto.
- `confusion/index.js`: Confusion — espiral e desorientação.
- `flamethrower/index.js`: Lança-Chamas — fluxo contínuo de fogo, sprites e brasas.
- `telekinesis/index.js`: Telecinese — levitação, anéis e pedras em órbita.

O `index.html` carrega `_runtime/begin.js`, os quatro golpes e `_runtime/end.js`, nesta ordem, e injeta o pacote no mesmo escopo do motor de batalha. A animação acontece a cada quadro via Canvas 2D, aproveitando o atlas de sprites já usado pelo jogo. Cada módulo registra nomes alternativos, duração e a própria função de desenho; editar apenas um módulo não modifica os outros.

**Segurança:** o arquivo antigo `effects/mewtwo-4moves-v3580.js` permanece intacto e serve como fallback se qualquer módulo modular não carregar. Os 25 fragmentos em `parts/` também permanecem intocados. Esta revisão não adiciona nem depende de bibliotecas externas.

**Diagnóstico:** no console do navegador execute `PokemonTorreMewtwo4FX()` durante uma batalha para ver os golpes registrados e as contagens de quadros. Os quatro precisam ter `renderedFrames` aumentando após a execução dos golpes.

**Para próximos golpes:** mantenha seus arquivos em pastas separadas. O editor LibreSprite pode gerar spritesheets, e PixiJS/Particle Emitter podem ser introduzidos em uma versão posterior sem mudar estas quatro pastas.
