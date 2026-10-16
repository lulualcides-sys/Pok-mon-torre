# V120 — conserto da batalha mobile (imagem do Ginásio de Cinnabar)

Pedido: corrigir a imagem enviada pelo usuário, que mostra Blaine duas vezes (apresentação de cabeçalho nativa + cartão V117 desnecessário), faixa "FASE 2/4" cobrindo arena, indicador genérico "Arena" sobre os HP e o botão fixo "Salvar / Migrar" cobrindo os controles dos golpes.

Solução **apenas de interface**, carregada na versão oficial e também em `?kanto119=1`: `effects/ui/battle-layout-v120.js`. Não altera sprites, habilidades, HP, ataques, probabilidades shiny, cooldown, IA, clima nem cache.

- Preserva a **equipe oficial do Blaine** exibida pelo motor; remove somente o cartão redundante `[data-v117-leader]`.
- Esconde o banner de arena V30 e apresenta a fase num **selo compacto no cabeçalho**, atualizado em `startBattle` / `nextFoe` / `renderBattle`.
- Esconde `#ptWebSave` **somente quando** `#modal.combatModal` está ativo. O botão e a funcionalidade de exportar/importar continuam disponíveis após o combate.
- Reduz espaçamentos excessivos, respeita a tela Android, evita que a HUD cubra a arena; a tag genérica "Arena" é ocultada, mas terrenos relevantes ainda aparecem.
- O V119 permanece prévia `?kanto119=1`, sem promoção antecipada.

Verificações: teste Node do DOM simulado, testes de regressão V95–V116 e teste Chromium mobile 440×940 normal/seguro incluindo os quatro defeitos fotografados.
