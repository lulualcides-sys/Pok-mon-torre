# Poké Arena 2D — Verificação dos 420 vídeos por evolução

[Captura original](https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39428271235)

Esta auditoria verifica a integridade de cada MP4, os estágios e as mudanças entre oito quadros reais da batalha.
Não interpreta mudança de pixels como confirmação de um golpe específico.

| Métrica | Valor |
|---|---:|
| expected | 420 |
| videoChecked | 420 |
| stageChecked | 420 |
| lowMotion | 0 |
| highMotion | 6 |
| other | 414 |
| videoErrors | 0 |
| distinctNames | 153 |

## Revisão prioritária
Os registros com pouco movimento, transições de tela e flashes intensos devem ser inspecionados individualmente.

| Pokémon | Forma | Golpe | Movimento médio | Categoria de triagem |
|---|---|---|---:|---|
| CHARMANDER | MEGA CHARIZARD X | Blast Burn | 92% | inspect_full_screen_flash |
| EXEGGCUTE | EXEGGUTOR | Egg Bomb | 86% | inspect_full_screen_flash |
| MAGIKARP | GYARADOS | Hyper Beam | 85% | inspect_full_screen_flash |
| ZAPDOS | ZAPDOS | Zap Cannon | 88% | inspect_full_screen_flash |
| BUNEARY | MEGA LOPUNNY | Bounce | 86% | inspect_full_screen_flash |
| JOLTIK | GALVANTULA | Thunder | 99% | inspect_full_screen_flash |

## Estado dos oito lotes
| Grupo | Vídeos validados | Problemas |
|---|---:|---:|
| e0 | 65 | 0 |
| e1 | 50 | 0 |
| e2 | 45 | 0 |
| e3 | 60 | 0 |
| e4 | 50 | 0 |
| e5 | 55 | 0 |
| e6 | 45 | 0 |
| e7 | 50 | 0 |

## Observação
Todos os 420 vídeos são capturas de comandos executados em uma sessão real de jogo.
Um MP4 íntegro e com movimento NÃO garante que o comando tenha disparado o ataque esperado.
Isso deve ser confrontado com o nome do golpe apresentado na interface e o efeito observado.
As imagens dos jogos de terceiros são usadas somente como referência, sem copiar ativos proprietários para Pokémon Torre 2.

Dados estruturados: [AUDITORIA-VIDEO.json](AUDITORIA-VIDEO.json).