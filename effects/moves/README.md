# Animações V35.82 — Pokémon Torre

Os quatro golpes foram aprimorados e executam em tempo real via Canvas 2D, sobre o atlas de sprites do próprio jogo, sem criar dependências de rede. Cada um permanece em pasta própria, com função e registro de duração exclusivos.

- psychic: carga, orbe com trilhas helicoidais e impacto radial (1050 ms)
- confusion: anéis mentais, espirais opostas e ondas de desorientação (960 ms)
- flamethrower: jato contínuo deformável, brasas, sprites de chama e impacto (1100 ms)
- telekinesis: pulso inicial, coluna de levitação, pedras e anéis orbitais (1250 ms)

O motor original dos 25 arquivos de partes não foi alterado. O carregador de `index.html` continua montando a animação dos quatro módulos e usa V35.80 como fallback se faltar algum arquivo. As rotinas de dano, tempo de recarga e posição dos Pokémon continuam no motor de batalha existente.

Console de diagnóstico: `PokemonTorreMewtwo4FX()` mostra os módulos e quadros renderizados. Animações implementadas no Canvas existente; PixiJS e Particle Emitter não foram instalados nesta atualização por compatibilidade e estabilidade.

## V35.83 — quatro novos feixes independentes

- **Hyper Beam / Hiper Raio** (`hyper-beam/index.js`): carga dourada/magenta, feixe estreito contínuo e impacto radial — 1230 ms, dano único aos 72%.
- **Aurora Beam / Raio Aurora** (`aurora-beam/index.js`): quatro fitas prismáticas oscilantes, núcleo branco e cristais no alvo — 1010 ms, dano único aos 65%.
- **Ice Beam / Raio de Gelo** (`ice-beam/index.js`): raio ciano com ramificações pontiagudas e explosão de cristais — 1130 ms, dano único aos 69%.
- **Solar Beam / Raio Solar** (`solar-beam/index.js`): concentração da luz solar, raio verde/dourado e folhas reais do atlas DS — 1370 ms, dano único aos 77%.

O carregador da página injeta os oito módulos no IIFE original. A alteração da duração atinge **somente** estes quatro novos golpes, preservando os outros ataques e o mecanismo de dano do motor. Para verificar o registro e a contagem de quadros, executar `PokemonTorreBeamFX()` no console da batalha. Sem dependências adicionais, PNGs externos, CSS de ataque ou alterações nos 25 fragmentos originais.

## V35.84 — Patch único para o catálogo restante

- 312 golpes adicionais do catálogo original, cada um com `catalog/<id>/index.js` independente.
- Fonte de verdade: nomes no `CONFIG` de V35.68, com aliases normalizados.
- O carregamento de navegador usa **um único `catalog/bundle.js`** gerado com a concatenação das pastas para evitar centenas de requisições HTTP. `catalog/painter.js` fornece os desenhos procedurais por tipo/estilo (dash, bolt, pierce, beam, area, hazard, status, recover).
- Os **8 golpes modulares anteriores**, os efeitos legados protegidos da V35.67 e os golpes de acabamento recente (Mordida, Labareda Final, Tsunami, Sopro de Dragão, Psybeam, Tempestade de Neve, Fúria Ancestral e Céu Tempestuoso) não são interceptados.
- `catalog/manifest.json` lista nome, tipo, categoria, estilo e caminho individual para refinamento posterior.
- Não altera dano, recarga, energia, alcance, os 25 fragmentos originais nem o carregamento de sprites pré-existente.
- Painel: `PokemonTorreCatalogFX()` no console. Efeitos do catálogo são **primeira versão visual**, sujeitos a revisão no jogo.

## V35.85 — Migração dos golpes para WebGL

Todos os 320 golpes registrados em módulos independentes agora **priorizam** o renderer PixiJS 7.4.3 (WebGL), convertendo os sprites existentes em `PIXI.AnimatedSprite` e aplicando `@pixi/particle-emitter` 5.0.10 para partículas reais no ciclo da animação. A camada é única, transparente, acompanha a arena e é destruída ao sair da batalha. A rotina de dano e o catálogo original permanecem inalterados.

**Fallback:** caso Pixi/WebGL/emitter ou o atlas não estejam disponíveis, o renderizador Canvas anterior continua funcionando para que os golpes não desapareçam. O novo renderer é exibido por padrão onde WebGL está disponível. Verificação no console: `PokemonTorrePixiFX()`.

LibreSprite é ferramenta de criação/edição de sprites, não de renderização no navegador. O projeto reaproveita o atlas DS original como fonte e documenta como editá-lo pelo LibreSprite, mas o executável LibreSprite não está disponível nesta sessão.

## V35.86 — correção dos golpes pelo nome

A renderização PixiJS agora usa **classificação semântica nome → forma → material/tipo**; os 312 golpes de catálogo e os 8 módulos antigos passam pelo mesmo pipeline WebGL, mas mantêm seus arquivos independentes. `semantic-vfx.js` implementa objetos reais e sequências diferentes: canhão de aço (corpo cromado, tiro sólido e estilhaços), Surf como onda curva, Fire Blast com silhueta de fogo, raios elétricos em ziguezague, jatos d'água, golpes de garra, chão rachando, explosões tóxicas, folhas, cristais, golpes físicos e efeitos de status. No canhão de ferro não são usados frames roxos/psíquicos.

Os filtros escolhem nomes específicos como `Canhão de Ferro`, `Flash Cannon`, `Canhão Metálico`, `Thunderbolt`, `Surf`, `Earthquake`, `Razor Leaf`, `Shadow Ball`, `Ice Beam`, `Solar Beam` e suas variantes; para os demais, características do nome têm precedência sobre o tipo e o `kind` informado pelo catálogo. Os efeitos são desenhados no WebGL do PixiJS (não no Canvas 2D). O atlas original é reaproveitado **apenas** em golpes de fogo, folhas e sombras que correspondam às texturas reais; estilhaços metálicos e partículas especializadas recebem suas próprias texturas GPU do PixiJS. Os efeitos antigos em Canvas permanecem exclusivamente como recurso de compatibilidade quando o navegador não disponibiliza Pixi/WebGL.

## V35.90 — Cinematic WebGL Renderer

A camada visual principal foi substituída por `_runtime/cinematic-vfx.js`, um compositor GPU WebGL com **shaders de fragmentos PixiJS** (materiais volumétricos de luz, água com espuma e ondulação, relâmpagos ramificados, reflexos cromados, cristais, fogo, nuvens tóxicas e choque luminoso), partículas `@pixi/particle-emitter`, spritesheet original de folhas/chamas/bolas sombrias/pedras e quatro fases de animação: carga, execução, impacto, dissipação. Os efeitos gráficos simples de `semantic-vfx.js` agora são fallback de compatibilidade, não a camada principal.

Sem alteração no motor de dano, salvamentos, arena, atributos ou cooldowns. Entre os estilos revisados por nome estão Canhão de Ferro (munição metálica), Surf (onda com espuma), Fire Blast (sprites reais de explosão flamejante), Thunderbolt (relâmpagos ramificados), cortes, água, gelo e o conjunto Hyper/Aurora/Ice/Solar Beam. Os outros golpes modulares usam as mesmas famílias visuais compatíveis com seu nome e tipo.

Os shaders têm suporte de baixa complexidade (ruído 4 oitavas) para celulares; efeitos são criados somente quando um golpe é disparado. Sem necessidade de instalação ou edição local. Diagnóstico de estilos: `PokemonTorrePixiFX()`.

## V35.91 — Tri Attack + partículas de 18 tipos

O módulo independente `tri-attack/index.js` exibe três feixes simultâneos reais: fogo vermelho/laranja, eletricidade amarela e gelo azul com sprites PixiJS filtrados pela GPU, três trilhas de partículas e três explosões que convergem, mantendo **um só evento de dano no motor**. O catálogo reconhece `Tri Ataque` e `Tri Attack`, com duração de animação 1320 ms. Partículas gerais passam a adotar a paleta visual de todos os 18 tipos, eliminando a cor roxa genérica de tipos não-psíquicos.
