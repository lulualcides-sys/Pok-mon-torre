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
