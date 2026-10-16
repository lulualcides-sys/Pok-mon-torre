# V123 — Kanto gameplay mega patch (16/10/2026)

**Pedido:** um patch único para nove áreas (IA dos líderes; progressão; recompensas; Centro Pokémon; encontros selvagens; Torre Infinita; itens; estatísticas; estabilidade e tamanho da batalha). Nenhum golpe aprovado foi recriado.

## Reutiliza sistemas existentes
- O Kanto V117 já traz os oito líderes e times; V119 já traz estratégias por líder.
- V27 e V35.60–V35.63 já implementaram a Elite Four, Blue, Torre Infinita, chefes a cada cinco andares, recompensas, recorde e fichas. V123 **não cria outra torre**.
- Centro Pokémon complementa loja e poções existentes. Salvamentos antigos V7–V9 continuam migráveis, sem renomear chave.

## Patch integrado
1. **Líderes:** além dos perfis V119, inimigos líderes reagem à vantagem de tipo, baixo HP e projéteis próximos; sem teleportes, dano artificial ou ajuste do HP original.
2. **Progressão:** ginásios 1–8 usam respectivamente 4,4,5,5,6,6,7,7 treinadores prévios, mais o líder. Se a partida já está adiantada, o alvo do ginásio atual nunca fica abaixo do progresso salvo. Os alvos fixam-se por ginásio em \`save.v123GymTargets\`. Os nomes/equipes originais dos ginásios mantêm-se.
3. **Recompensas:** treinador intermediário em etapa par e líder liberam uma escolha única: 36% de HP, EXP ou 2 Pokébolas + 25 moedas. Recompensa pendente permanece salva; a escolha não é duplicada.
4. **Centro Pokémon:** cura completa, grátis uma vez por etapa; depois custo moderado em moedas. Sem cura ilimitada gratuita.
5. **Selvagens:** cinco encontros em vez de três por parada; a tabela de probabilidades V27 continua sendo a fonte tanto das chances como do sorteio. UI, botão e painel de odds seguem o mesmo limite; indicador de espécie rara; **shiny V119 continua exatamente 1%**.
6. **Torre Infinita:** preserva pós-jogo existente, com recorde/estatísticas ampliados e partidas registradas; os desafios e drops já aprovados mantêm-se.
7. **Itens estratégicos:** no máximo duas poções e uma superpoção por batalha. Não altera preços, cura/energia nativas, nem o sistema de captura.
8. **Carreira e recordes:** botão visível no menu com totais de vitórias/derrotas, resets da jornada guardados separadamente em \`pokeTorreV123Lifetime\`, vitórias/derrotas de cada membro Elite Four e líder, títulos, encontros raros, capturas, recompensas, Centro Pokémon, itens, Torre e últimas 75 partidas. Os resultados antigos de Elite usam \`v119LeagueHistory\` quando disponíveis; dados que não foram registrados antes da V123 não são inventados. Ao resetar, contagem vitalícia de resets não é apagada.
9. **Travamento e tamanho:** limites adaptativos de partículas/anel/números em celular, enquanto conserva projéteis e o cronograma de dano. Aquecimento assíncrono de sprites já carregados; diagnóstico de custo do cast e frames lentos; **nenhum segundo loop gráfico**. Aumenta a arena no retrato e amplia Pokémon cerca de 7,5% sobre a escala oficial V122; **não altera hitboxes**.

## Proteção e verificação
- Mewtwo V95; arena tecnológica azul V98; gelo V101; V107/V110; quatro Veneno V111, V114, V122; Rain Dance V118; V119; V120; IA de contato V121 preservados.
- V123 não muda nenhuma spritesheet aprovada e não altera a implementação nativa de hitTarget, dano, energia, captura ou golpes.
- Desligamento isolado: \`?game123=0\` no endereço do jogo permite comparação, sem remoção de salvamento.
- Testes: \`tests/v123-mega.test.cjs\` com regressão Node + testes V119, V120, V121 e V122. Os testes Chromium existentes incluem batalha Android simulada; estabilidade em aparelho físico e 60 FPS sustentados não podem ser garantidos sem medição real.
