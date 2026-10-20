# REFERÊNCIA VISUAL — PokéArena2D (vídeos enviados, 19/10/2026)

**Status:** análise visual dos quatro vídeos fornecidos. **Não foi extraído código, sprites de golpes ou arquivos do domínio pokearena2d.com.**
O domínio original não respondeu à consulta web nesta sessão, de modo que não há evidência para afirmar o motor/renderizador usado internamente.

## O que os vídeos efetivamente demonstram

Os três clipes com marca d'água `www.pokearena2d.com` mostram batalhas em arena vista de cima, com sprites pixelados, ataques localizados e leitura clara de hit, área e trajetória.
O quarto clipe (Pokémon x Dark Souls / Mewtwo) é uma referência de jogo **diferente**: não confundir tecnologia nem ativos.

| Movimento mostrado | O que reproduzir com arte PRÓPRIA ou recursos licenciados | Evitar |
|---|---|---|
| Hyper Beam (laser amarelo / branco) | Feixe fino central, pontas de chama/spark nas extremidades, 12–16 quadros, expansão curta no contato | explosão genérica contínua, bloco reto ou luz pesada |
| Projétil água/gelo | Cadeia irregular de gotas/faíscas azul-claro com pequena explosão no inimigo, 8–12 quadros | bolhas enormes e efeitos que cubram HUD |
| Shadow Blast | Projétil roxo escuro com núcleo variável, impacto curto e escuro, 12 quadros | esfera uniforme neon sem contorno |
| Seismic Toss | Contato próximo e deslocamento/poeira curta no solo, 8–12 quadros | projétil saindo do lutador |
| Frenzy Plant | Brotos/raízes distribuídos em torno do centro, 12–16 quadros; zonas limitadas | manchas sobre menus, troncos grandes |
| Golpes de fogo (chama de contato) | pequenas línguas de fogo amarelo-laranja, 8–12 quadros, escala ligada ao Pokémon | fogo cobrindo toda a arena |
| Golpes físicos | flash de contato, curtíssimo, com contorno legível; dano sincronizado | dezenas de partículas e duração excessiva |
| Status e Dragon Dance | símbolo/aura pequena e temporária em torno do próprio ator | explosão luminosa simulando ataque |

## Padrão de engenharia para Pokémon Torre

1. Preservar TODOS os golpes aprovados no `effects/moves/STATUS_APROVADOS.json` — inclusive Absorb V177.1, Bubble, Water Gun, Surf, V172 Flamethrower.
2. Criar prévias separadas por golpe, sem mexer nos arquivos aprovados; manter rollback por query string.
3. Cada novo golpe visual usa PixiJS WebGL existente; quando usar sprite, elaborar atlas original de 8/12/16 quadros em pixel art, nearest-neighbour, outline preto e sem Canvas2D como renderizador do golpe.
4. Registrar duração de preparação, voo, impacto e dissipação; um único golpe nativo, sem dano/cura/cooldown novo; garantir que não haja overlay depois da batalha.
5. Priorizar clareza e baixos custos GPU/CPU antes de pós-processamento.
6. Não copiar código fechado, burlar autenticação/proteções ou redistribuir arquivos de golpes sem licença/permissão aplicável. Inspecionar apenas recursos publicamente servidos e licenciados.
7. Um crédito à PMD SpriteCollab **não** implica que efeitos de ataque exclusivos do PokéArena2D tenham a mesma licença.

## Fonte pública com licença verificável

- **PMD SpriteCollab**: https://github.com/PMDCollab/SpriteCollab
- Licença da coleção de **artes originais licenciadas**: https://github.com/PMDCollab/SpriteCollab/blob/master/LICENSE.md
- Navegador de sprites e créditos por artista: https://sprites.pmdcollab.org/
- A coleção declara **CC BY-NC 4.0** para conteúdo coberto pela licença, com atribuição e finalidade não comercial. A coleção também contém sprites originários de jogos oficiais: conferir procedência de cada ativo, pois os autores do repositório não necessariamente podem sublicenciar o que é de terceiros.
- **Site em referência nos vídeos**: https://www.pokearena2d.com/ (não acessível para auditoria direta nesta sessão; nenhuma tecnologia de engine afirmada).
- **Não confundir com** https://pokemonarena2d.online/ (site de nome parecido, mas não comprovado como mesmo jogo).

## Próximo trabalho de arte

Recriar **um lote de 4 golpes visuais independentes** para comparar com vídeos sem sacrificar o aprovado: Shadow Blast, Hyper Beam, um contato físico (Seismic Toss) e Frenzy Plant. Não marcar nada como aprovado sem teste real do usuário.
