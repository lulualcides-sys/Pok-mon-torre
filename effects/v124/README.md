# V124 — Troca de Pokémon com Pokébola vermelha e IA estratégica

## Aprovação da V124.1 (16/10/2026)

**Aprovada com ressalvas pelo usuário:** “Ficou mais ou menos mas dá pra salvar”. O estado V124.1 do commit `b7eab794d1752a4c60d8d1e2bd21d52691cd19d6` deve ser preservado, sem ajustes extras até uma nova solicitação. Os testes do commit passaram e o GitHub Pages confirmou a publicação. Ver `effects/v124/STATUS_APROVACAO.json`.

## V124.2 — Sincronização Pokébola × raio vermelho (16/10/2026)

**Motivo:** feedback: a Pokébola se movia por animação CSS/DOM, mas o raio vermelho nascia de uma coordenada fixa no Canvas, causando desalinhamento no celular, na rotação e nas trocas do adversário.

- Antes de cada desenho do feixe, converter o **centro real da Pokébola visível** em coordenadas do Canvas usando `getBoundingClientRect()` da bola e do Canvas (`x=(ball.centerX-canvas.left)/canvas.width*engine.w`, mesma fórmula para `y`).
- No recolhimento, acompanhar a `.v124Ball` animada do treinador. Na entrada, acompanhar a `.v27Throw.left/.right .v27ThrowBall` nativa do treinador V27, inclusive durante o arremesso.
- Se o sprite HTML ainda não estiver medível numa troca, conservar o último ponto válido para não fazer o feixe saltar entre dois pontos.
- Nenhum outro temporizador, RAF, segunda Pokébola, CSS ilustrativo ou alteração de hitbox, dano, HP, shiny, IA, tamanhos ou golpes.
- Arquivada a V124.1 aprovada em `effects/v124/approved/recall-ai-v124-1.js`, **sem alterar seu código**. O jogo normal utiliza V124.2 após a aprovação do usuário para corrigir apenas a sincronia; `?swap124=0` segue como rollback.
- Regressão `tests/v124-recall-ai.test.cjs`: verifica origem geométrica exata do laser nas duas fases e nos dois lados, treinador único, HP/status/shiny e IA; validar publicação em GitHub Actions antes de declarar concluído.

**Status: APROVADA pelo usuário em 16/10/2026** — “Pode salvar, ficou melhor”. Congelar o visual/tempo/posição da Pokébola e o raio vermelho da V124.2, preservando a troca estratégica do adversário, V124.1 e todas as versões anteriores. Commit de referência `1a095c595fa016f6ef3f8bc4b17237ed190ca305`; testes e GitHub Pages aprovados. Registro `effects/v124/STATUS_V124_2.json`.


## V124.1 — Ajuste visual do treinador (16/10/2026)

Feedback após jogar: o raio vermelho e a troca estratégica foram aprovados, mas o sprite do treinador na troca estava distorcido/duplicado. O patch **V124.1** mantém as mecânicas e só corrige a transição visual:

- Ao iniciar o recolhimento, elimina um eventual sprite de arremesso V27 anterior que ainda esteja na arena (não apaga sprites do Pokémon).
- Durante o recolhimento, apresenta somente o treinador e a Pokébola com pose estável, mantendo o sprite da galeria V27.
- Quando chega a hora de enviar o novo Pokémon, **remove o treinador de recolhimento antes de chamar o `switchMon`/`newEnemy` nativo**, que já apresenta o treinador V27 enviando a Pokébola. Assim não ficam dois treinadores sobrepostos.
- No inimigo, remove o `scaleX(-1)` sobre a figura inteira, que espelhava e podia distorcer o sprite de líder; aplica posições específicas de treinador e Pokébola.
- Não altera raio vermelho, sincronização do Pokémon, IA estratégica, HP, status, shiny, golpes aprovados, progressão ou salvamentos.
- O teste `tests/v124-recall-ai.test.cjs` verifica o handoff, ausência de espelhamento e sprite duplicado para os dois lados; o workflow exige `node --check` e regressões V123/V121.

A aprovação visual final de V124.1 depende de jogar no celular; nenhuma imagem externa, PNG estático ou mockup foi utilizado.


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
