# Poké Arena 2D — situação do elenco observável (20/10/2026)

**Referência:** execução de coleta real [#39419765383](https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39419765383).
**Verificação visual suplementar:** [#39421201214](https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39421201214), artefato `rea-roster-26-verificacoes`.

## Seleção pública sem login

O menu Training apresenta 26 quadrados de seleção, distribuídos em duas linhas de 13. Na captura de 20/10/2026, são **4 criaturas sem cadeado claramente identificáveis**:

| Índice (0-base) | Pokémon selecionável | Ação |
|---:|---|---|
| 0 | Bulbasaur | 5 controles registrados |
| 1 | Charmander | 5 controles registrados |
| 2 | Squirtle | 5 controles registrados |
| 11 | Pichu | 5 controles registrados |

Os outros **22 quadrados exibem cadeados** na tela observada. Isso **não** significa que não possam ser desbloqueados por progressão legítima; significa que não estavam disponíveis nas sessões de Training verificadas.

## O que está registrado

- 20 sequências reais de gameplay, com 25 capturas por comando (500 screenshots).
- Para cada sequência: um contact sheet, imagens da seleção e da arena, metadados de entrada e variabilidade visual.
- 90 registros de spritesheets na REA, **sem alegar que foram todos ativados durante as batalhas**.
- Os arquivos visuais completos estão nos artefatos temporários do GitHub Actions. O índice permanente está nesta pasta.

## Nota sobre o scanner de elenco

A primeira varredura de todos os ícones detectou `no_change_or_locked` para 26 posições, uma classificação **inválida**. O jogo alterna automaticamente o foco de seleção para o painel Dummy quando o primeiro personagem é escolhido. Os clicks posteriores passaram a mudar o Dummy, e não o jogador; a comparação que inspecionava apenas o nome do jogador não percebeu essa mudança.

Por isso, o resultado numérico dessa varredura **não deve ser interpretado como prova de bloqueio**. O estado do elenco acima foi conferido visualmente nas capturas de seleção e pelos quatro testes de batalha executados com personagens distintos.

## Pendências para cobrir todos os golpes

1. Desbloquear outros personagens por caminhos normalmente oferecidos pelo jogo, quando disponíveis sem autenticação e sem contornar cadeados.
2. Registrar separadamente as animações dos novos cinco comandos de cada personagem alcançado.
3. Verificar se movimentos diferentes compartilham spritesheets ou se efeitos diferentes compõem o mesmo movimento.
4. Só classificar um golpe como confirmado quando a animação e sua identificação visual forem observadas em batalha.

**Não copiar arte ou código de terceiros para Pokémon Torre sem permissão/licença; o material aqui é apenas de estudo visual.**
