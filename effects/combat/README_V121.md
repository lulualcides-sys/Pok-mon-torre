# V121 — Correção dos inimigos Lutadores (Machamp, Hitmonlee, Hitmonchan)

**Correção oficial para a batalha do Bruno na Elite Four**, e para qualquer Pokémon adversário com tipo principal ou secundário Lutador (inclui Primeape, Machoke e Poliwrath). Antes, o motor original mantinha todos os inimigos a ~39% da altura da arena e disparava projéteis, independentemente do tipo. Com isso os Lutadores nunca chegavam ao alcance necessário para seus golpes físicos.

Este módulo, carregado por último após as IAs V117/V119, mantém o jogo original como autoridade sobre HP e efeito do golpe:
- Lutadores se aproximam continuamente (respeitando terreno e colisões), até ~15% da altura da arena.
- Ataque é iniciado SOMENTE perto da vítima, com antecipação real de 0,27 segundo; dano somente se o inimigo AINDA estiver perto no fim da animação. Em caso de fuga ou esquiva, o golpe erra de verdade.
- Dispara `hitTarget('player','fighting',power)` original, sem inventar dano e sem ignorar invulnerabilidade, pausa, sono ou congelamento.
- Bloqueia as bolas/feixes de "fighting" do comportamento antigo desse inimigo, sem afetar projéteis de outros tipos e sem modificar golpes equipados pelo jogador.
- Mantém a IA de todos os não-Lutadores, sprites, partículas/visual de golpes aprovados, Arena V98, V95/V115/V116, Rain Dance V118, shinies e todos os saves intactos.
- Usa o mesmo frame loop do motor, sem timers extras nem serviços pagos.

O módulo fornece `window.PokemonTorreEnemyFightingV121.diagnostics()` para confirmar tentativas e acertos. Testes cobrem seis espécies, sono, pausa, esquiva, alcance, invulnerabilidade, adversários de longa distância e batalhas reais em Chromium Android normal e seguro.
