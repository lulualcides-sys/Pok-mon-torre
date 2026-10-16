# V124 — Troca de Pokémon com Pokébola vermelha e IA estratégica

Implementado a pedido do usuário em 16/10/2026, preservando a **V123 aprovada** e todos os golpes V95–V122.

## Animações e interação
- A opção Equipe na batalha conserva o menu nativo de troca. Ao selecionar outro Pokémon saudável, mantém a equipe atual durante o **recolhimento**: treinador animado usa o sprite V27 existente, lança um raio vermelho com núcleo claro e o Pokémon encolhe na direção da Pokébola.
- Na metade da animação, ocorre a substituição real pelo motor (mesma penalidade de 12 de energia e reset de cooldown do jogo). Novo Pokémon **aparece com raio vermelho** e escala progressiva. Após 1,42 s o combate é retomado, sem dano enquanto a equipe está pausada.
- O lado inimigo utiliza o sprite do líder/treinador do jogo, e o mesmo recolhimento e envio. Recolhimento não é usado no nocaute; quando o Pokémon desmaia, apenas o próximo entra com efeito de envio.
- Sem loop RAF extra, sem imagens mockup, sem modificar as spritesheets ou os efeitos dos golpes.

## Inteligência de troca (equipes de treinadores, líderes e Liga)
- Após alguns segundos, com intervalo mínimo de 11 segundos e limite de trocas, a IA avalia vantagem ofensiva e resistência ao tipo do jogador, HP próprio e HP do próximo membro.
- Quando a vantagem é relevante ou o atual está perto de desmaiar, seleciona **somente um Pokémon ainda vivo da equipe na fila**, recolhe o atual mantendo HP, nível, status, shiny e propriedades e devolve o Pokémon anterior à fila. A troca não altera o total de monstros nem avança a fase do chefe. Usa o motor nativo de `newEnemy()` para atualizar HUD e recursos.
- Sem troca em batalha selvagem, laboratório/testes, apenas um Pokémon restante, usuário pausado ou quando o novo Pokémon não traz vantagem estratégica.

## Proteção e validação
- V123 salva e protegida em `effects/v123/STATUS.json`, publicada no commit `a0c1d01481d9669e6130ad77c3ca58fb6cdbdab3`.
- `tests/v124-recall-ai.test.cjs` simula recolhimento e envio dos dois lados, preservação da fila, do HP, status e shiny, sincronização, limite de troca, sem atalhos na vitória.
- O modo `?swap124=0` desliga **somente** V124 para comparação com o motor nativo. A física, os ataques e a IA V121 permanecem intactos.
- Testes Chrome Android simulados não substituem aferição em aparelhos físicos; não afirmar fluidez estável sem medir.
