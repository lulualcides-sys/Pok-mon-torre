# Pokémon Torre V126 — progressão Kanto, sumário dos Pokémon e otimização mobile

Pedido em 16/10/2026 (duas capturas Android): após aprovar V125, aumentar os treinadores anteriores a cada líder, permitir tocar no Pokémon da equipe para editar golpes, retirar o emoji de tipo atrás do sprite, melhorar travamentos.

**Treinadores antes de cada líder:** 13, 15, 17, 19, 21, 23, 25, 27 para Brock, Misty, Lt. Surge, Erika, Koga, Sabrina, Blaine e Giovanni respectivamente. A luta contra o líder permanece adicional; a Elite Four é mantida. Etapas já salvas não regredirão ou serão descartadas. `v29TrainerCount` do motor e consumidores passam a usar esse valor via patch carregado por último.

**Toque direto:** os cartões `.teamrow .moncard` da tela inicial passam a ativar exatamente o editor de quatro movimentos V33.1 do Pokémon selecionado. O patch utiliza os próprios botões nativos do editor, sem duplicar catálogo ou modificar os movimentos, seus níveis ou as TMs. Teclado (Enter/Espaço) e acessibilidade incluídos. Dados de PV/nível/tipo aparecem antes dos quatro espaços de golpe.

**Emojis atrás de Pokémon:** a camada de placeholder tipo emoji (`.spritewrap > .placeholder`) é oculta somente se existir a imagem do sprite real; sem retirar sprite, tipo, nome, raridade ou ícones da PokéMart. A camada fica disponível se a imagem falhar, respeitando fallback.

**Travamentos no Android:** desabilita borrão de fundo de modais no celular, ativa `content-visibility:auto` para centenas de opções de golpe de Mewtwo e evita filtros CSS pesados nos Pokémon de cartões fora da batalha. Monitor leve coleta amostras de frame lento usando o loop já existente; nenhum RAF/Canvas extra ou modificação de FX/dano aprovada. Não é promessa de FPS perfeito sem testar no aparelho.

**Versões preservadas:** V125 PokéMart aprovada, V124.2 recall raio vermelho, V123 campanha (exceto ampliação explicitamente solicitada), V95–V122 e catálogo de golpes. Chave isolada de comparação `?ui126=0`.

**Verificação:** `tests/v126-gameplay-ui.test.cjs` valida escada de 13–27, não regredir saves, clique na espécie e editor certo, esconder apenas emoji com sprite, custos de composição no celular, sem alterações no motor de golpes. GitHub Actions e GitHub Pages devem passar antes de declarar publicação.

**Status: APROVADA E PROTEGIDA pelo usuário em 16/10/2026** — confirmação expressa “Aprovado”. Congelar os 13–27 treinadores progressivos, clique no cartão abrindo editor do Pokémon, remoção de emojis atrás do sprite real e otimizações leves Android. Não editar estes recursos sem pedido posterior. Commit jogável aprovado `448db0e38a14a93130fb9c3a4f3c98e49b1c7a76` (testes CI e Pages confirmados). Registro em `effects/v126/STATUS_APROVACAO.json`.
