# SCRIPT MESTRE — POKÉMON TORRE (15/10/2026)

## Status V123–V124 (16/10/2026)

- **V123 aprovada expressamente** em 16/10/2026, salva/protegida em `effects/v123/STATUS.json`. Preservar IA, progressão, centro, cinco encontros por etapa, carreira/Elite Four/Blue/reset, recompensas, Torre Infinita, medidas contra travamentos, arena ampliada e sprites. Aprovada pelo usuário após jogar no celular.
- **V124 solicitada**: raio vermelho de retorno à Pokébola e entrada do próximo Pokémon com treinador original V27, efeitos de ambos os lados, e treinador inimigo realizando trocas táticas, sem duplicar roster nem resetar HP/status/shiny. Guardar V123. V124 requer confirmação de testes + deploy, sem declarar aprovada visualmente antes do usuário.
- Continuar proibido alterar golpes aprovados sem autorização; nova animação de troca não deve mexer em nenhum golpe. Leia `effects/v124/README.md`.

## Continuidade oficial confirmada em 16/10/2026 — V119 a V122

- V119 aprovada pelo usuário e incorporada à URL normal, com `?kanto119=0` para diagnóstico; registro em `effects/v119/STATUS_APROVACAO.json`.
- V120 aprovada e protegida; correção de layout Blaine, registros em `effects/v120/STATUS_APROVACAO.json`.
- **V121 aprovada expressamente em 16/10/2026**, manter `effects/combat/enemy-fighting-contact-v121.js` e registrar em `effects/v121/STATUS_APROVACAO.json`. Não regredir para projéteis Lutador à distância.
- **V122 aprovada expressamente em 16/10/2026**, incluindo os quatro golpes Veneno da prévia: **Venoshock, Toxina Pesada, Rajada Ácida, Golpe de Veneno**. Integrar ao jogo **normal**, preservar V111, V114 e todos outros golpes aprovados. O marcador `+` desses quatro deve aparecer no menu. O parâmetro `?poison122=0` restaura visual anterior de Venoshock para diagnóstico. Ver `effects/v122/STATUS_APROVACAO.json` e `effects/moves/STATUS_APROVADOS.json`.
- Manter escala/efeitos V95, arena tecnológica azul V98, Raio de Gelo V101, Cross Chop V107, golpes V110 em teste e Rain Dance V118.
- Testar Node e Chromium Android normal/seguro e confirmar CI + deploy do commit antes de declarar a atualização concluída. A simulação Chromium não é teste em dispositivo Android físico.
- Demais instruções históricas abaixo, inclusive referência antiga dizendo 'V111 última', descrevem o estado anterior à aprovação V119–V122 e não revogam este cabeçalho.


**INSTRUÇÕES ATUAIS E PRIORITÁRIAS.** Em caso de divergência com revisões históricas abaixo, aplicar este Script Mestre. Repositório: https://github.com/lulualcides-sys/Pok-mon-torre. Jogo: https://lulualcides-sys.github.io/Pok-mon-torre/.

1. **Alterar o jogo real:** trabalhar diretamente no GitHub quando o acesso estiver disponível; implementar, testar e publicar via Pages. Não substituir programação por imagens, Ateliê, código solto ou arquivo para baixar. **Nunca declarar concluído sem confirmar commit, testes e publicação.** Informar o link jogável.
2. **Golpes cinematográficos:** utilizar LibreSprite, PixiJS e PixiJS Particle Emitter quando disponíveis e compatíveis; ser fiel aos Pokémon originais. Contorno preto, contraste, luz, partículas, antecipação, trajetória, impacto e dissipação. Golpes simples 8 quadros, médios 12, complexos 16; animações fluidas e visíveis, sem rapidez excessiva, efeito genérico reutilizado ou PNG estático como substituição. Dano sincronizado no quadro real de contato. Golpes proporcionais e sem invadir HUD/menus nem persistir depois da luta.
3. **Isolamento e proteção:** cada golpe em pasta com código independente. Consultar `effects/moves/STATUS_APROVADOS.json` antes de editar. **Não alterar arte de golpes aprovados sem autorização explícita; preservar snapshots e salvamentos.**
4. **Prévia:** lotes de quatro golpes. Para substituir golpe já aprovado, disponibilizar animação funcional na batalha online, com preparação, trajetória, impacto e dissipação; aguardar a aprovação para integrar à versão oficial. **Não criar Ateliê dentro do jogo, nem enviar imagens quando o usuário pedir programação.**
5. **Pokémon:** acabamento Mewtwo V95 aprovado como referência (contorno preto, nitidez, cor, luz, sombra, contraste). Replicar apenas a pedido, em lotes, sem redesenho geral, rigging individual dos membros ou Mega Evolução.
6. **Arena:** V98 aprovada, estádio tecnológico azul com piso quadriculado, metal, detalhes horizontais, espaço ampliado e câmera acompanhando a luta. Não restaurar floresta V96. Preservar o trabalho aprovado.
7. **V99 + V100:** verificar estado real do GitHub; unificar quatro slots históricos de gelo e deduplicação PT/EN, **preferir Raio de Gelo a Ice Beam**. Preservar os efeitos aprovados dos outros golpes, nomes internos antigos, equipamentos, salvamentos, dano e aliases. Mostrar só uma opção por ataque equivalente; ataques diferentes continuam distintos.
8. **Testes antes de publicar:** abrir no Chromium/navegador; executar quatro ataques históricos em batalha e os três tipos canônicos sem duplicações; confirmar impacto e HP, regressões dos aprovados, Android/celular, modo seguro e publicação efetiva de GitHub Pages.
9. **Autonomia:** implementar e revisar com ferramentas conectadas; explicar brevemente o que mudou e fornecer link do jogo. Se algo ainda não foi validado, informar o estado real em vez de declarar sucesso.


## Continuidade operacional — V111 (15/10/2026)

Esta seção registra o último estado **verificado no GitHub**, sem alterar arte, código de batalha ou salvar versões não confirmadas. A última versão funcional identificada é **V111** (não renomear por mera atualização de documentação).

- **Registro oficial:** `effects/moves/STATUS_APROVADOS.json`. Os quatro golpes `Picada Tóxica`, `Picada Venenosa`, `Venoshock` e `Ferrão Venenoso` estão com `version: "V111"`, `status: "aprovado"`, `aprovacao_visual: "salvo_com_ressalvas"` e `protect: true`. O feedback foi **"Pode salvar, ficou ruim mas tá bom."** Trata-se de autorização para manter a versão atual, **não** de elogio ou autorização para refazer. Não modificar esses quatro visuais sem novo pedido explícito.
- **Isolamento V111:** `effects/moves/v111-poison/renderer.js` e spritesheets individuais (12, 12, 16 e 12 quadros). Não substituir por efeitos genéricos; não mexer no dano e recarga do motor V359.
- **Referências anteriores:** Cross Chop preserva o X vermelho V107 a **30%** do tamanho original e centralizado no corpo do adversário. Chute, Golpe de Karatê e Brick Break mantêm impactos curtos V110 sem mãos/pés flutuantes; estes quatro constam **em_teste**, não presumir aprovação final. Preservar Mewtwo V95, estádio tecnológico azul V98, e os efeitos de gelo V99/V100/V101 com o nome exibido **Raio de Gelo** e deduplicação PT/EN.
- **Próximos pedidos:** selecionar exatamente os quatro golpes indicados, pesquisar primeiro a galeria interna, gerar 8/12/16 quadros conforme complexidade, demonstrar prévia **funcional na batalha online**, e só promover para jogo normal após aprovação se o efeito substituído já estiver protegido. Nada de ateliê, imagens de conceito no lugar de código ou links para baixar patch.
- **Critérios de regressão:** testar inicialização, quatro golpes, dano no impacto, aproximação/recuo nos físicos, modo normal/seguro, histórico de efeitos, arena, sprites e desempenho mobile. `tests/poison-v111.test.cjs`, `tests/browser-v111-fast.cjs`, `tests/wide-stadium-v98.test.cjs` e `tests/ice-v101-official.test.cjs` são verificações importantes.
- **Limitação do teste mobile:** a automação existente usa Chromium headless com user-agent Android e resolução mobile, **não** um aparelho Android físico. Os logs de CI mostram FPS variável inclusive no primeiro ataque; objetivo de 60 FPS não significa meta comprovadamente atingida.
- **Publicação:** confirmar commit `main`, testes e `actions/deploy-pages@v4` com sucesso e a URL final `https://lulualcides-sys.github.io/Pok-mon-torre/` antes de declarar uma alteração publicada; diferenciar deploy bem-sucedido de teste manual em aparelho real.

Esta orientação prevalece sobre quaisquer instruções históricas conflitantes abaixo.

---

## Histórico (regras antigas subordinadas ao Script Mestre acima)

## V82 — corrigir quais são os quatro golpes do print de Mewtwo

- **O usuário pediu os quatro golpes salvos nos espaços superiores**: 1. Chicote de Vinha; 2. Folha Navalha; 3. Chicotes em Área; 4. Vine Whip. **NÃO** são os quatro do filtro Planta abaixo (Esporos, Pó do Sono, Stun Spore, Leech Seed).
- Criar prévia destes quatro **dentro da batalha pelo link do GitHub**, sem Ateliê nem foto de mockup, e sem substituir suas versões atuais antes da aprovação. Rota de prévia: `?battle_preview=v82`.
- Os efeitos em teste ficam em `effects/moves/v82-preview` e geram **32 quadros reais** a partir das artes de vinha já existentes, com identidades próprias (uma vinha, várias lâminas, três chicotes, duplo chicote).
- Os outros quatro de status Planta V63 permanecem aprovados e intocados; preservar também o Chicote de Vinha atual até a aprovação explícita dos novos efeitos.
- Acerto e dano devem coincidir com o quadro de impacto visual; nunca diminuir o HP antes do contato.
- Qualquer próximo lote exige confirmar que são os quatro **equipados** quando o usuário mostrar um menu com quatro espaços.

## Revisão V81 — quatro golpes aprovados e dano sincronizado

- Usuário **aprovou** o resultado V80 de Dragon Pulse e Aura Sphere, incluindo **impacto sincronizado ao dano**. Dragon Claw e X-Scissor já estavam aprovados desde V77. **Os quatro devem ficar na batalha normal, sem ?battle_preview e sem Ateliê.**
- Usar `effects/moves/v81-approved/render.js` em jogo normal: mantém os atlas V77 para Dragon Claw/X-Scissor e V78 para Dragon Pulse/Aura Sphere. Tamanhos compactos e durações mantidos; **sem badge de prévia**.
- Executar `effects/moves/_runtime/impact-sync-v80.js` após V47 também no jogo normal. Dano de Dragon Pulse e Aura Sphere ocorre no início do quadro 6/8 da animação (5/8 do tempo total), usando a fila V359 original, sem mudar hitTarget/dano, e sem o fallback V47 prematuro desses dois movimentos.
- **Não alterar** Thunder, Discharge, Thunder Wave, outros efeitos aprovados, pontos de vida de forma artificial, recarga, custo ou proteção de status.
- A rota `?battle_preview=v80` pode continuar como referência técnica histórica, mas o jogador deve ver as quatro animações aprovadas no link normal.

# Pokémon Torre — instruções permanentes para desenvolvimento

Este documento registra as regras do projeto para qualquer alteração de golpes e animações. **Não limitar as melhorias a golpes elétricos**: o tipo e os golpes trabalhados são definidos pelo pedido mais recente do usuário. Essas regras aplicam-se igualmente a fogo, água, grama, gelo, lutador, psíquico, fantasma, pedra, terra, voador, inseto, dragão, fada, venenoso, normal, sombrio, aço e elétrico, além de golpes especiais e exclusivos.

## Padrão visual obrigatório

- **Efeitos detalhados, cinematográficos e bonitos**, não genéricos ou simplificados. Dar atenção a silhueta, contornos pretos finos quando adequados, iluminação, cores fiéis ao tipo, profundidade visual, composição, partículas, impacto, antecipação, movimento e dissipação.
- As animações devem ter **múltiplos quadros reais e movimento perceptível**. Evitar uma única figura PNG estática, um brilho genérico, círculos CSS, filtros simples ou a mesma animação recolorida para golpes diferentes.
- Cada golpe precisa ter identidade visual própria e, quando houver referências/sprites fornecidos, respeitar o efeito original e a referência aprovada.
- Preferir sprites e spritesheets enviados pelo usuário. Onde for tecnicamente compatível, usar LibreSprite para autoria, PixiJS para renderização 2D e PixiJS Particle Emitter para partículas. Não presumir instalação destas ferramentas; verificar antes.
- Usar efeitos e enquadramento proporcionais: não encolher nem ocultar indevidamente os Pokémon, e manter textos de batalha discretos, legíveis e pequenos.

## Comportamento e fidelidade ao golpe

- O golpe deve **atingir o alvo correto**, registrar o acerto/dano e sincronizar o impacto com os quadros de animação. Verificar também falha, imunidade, status e efeitos secundários conforme a mecânica.
- Respeitar categoria, alcance e tipagem verdadeiros: ataques físicos de contato aproximam o Pokémon e acertam de perto; ataques à distância projetam o efeito até o inimigo; golpes de status não devem se comportar como proteção ou causar dano indevidamente.
- A animação deve deixar claro o início, a trajetória, a colisão e o final; a direção precisa acompanhar o atacante e o defensor.
- Efeitos de chamas, ondas, raios, impactos e semelhantes devem ter comportamento coerente com a identidade específica do golpe, não apenas cores associadas ao tipo.

## Processo padrão para cada novo pedido

1. Trabalhar **exatamente os golpes que o usuário pedir, de qualquer tipo**. Não assumir que todos os próximos pedidos são elétricos apenas por causa da V55/V56.
2. **A prévia de aprovação é um painel externo de apresentação dos golpes**, como a referência enviada pelo usuário: logo do Pokémon Torre, nome, tipo/categoria, descrição e 8 quadros numerados da animação, com acabamento cinematográfico. **Não é print nem modal dentro do jogo.**
3. Após a aprovação da prévia, **implementar os efeitos funcionais no jogo e publicar no repositório** quando houver escrita autorizada. A prévia não substitui o trabalho no jogo; se o usuário solicitar aplicação imediata, seguir essa instrução e não gerar novas fotos.
4. Manter cada golpe em pasta/módulo isolado e evitar regressões nos outros efeitos aprovados.
5. Testar carregamento do jogo, exibição do efeito, acerto e dano, alinhamento, desempenho, e compatibilidade com o renderizador. Não afirmar que os testes passaram sem executá-los.
6. Organizar as pastas sem afetar o funcionamento e preservar salvamentos e conteúdo existente. Preferir atualizações no site já publicado, evitando downloads manuais a cada versão.

Estas são **diretrizes permanentes de desenvolvimento**, não uma declaração de que todos os golpes já foram refeitos ou testados.

## Revisão V79 — tempo de leitura dos efeitos e marcadores incompletos

- Usuário aprovou o tamanho compacto e a arte de Dragon Claw e X-Scissor da V77; **não alterar a duração, os quadros nem as artes desses dois**.
- Dragon Pulse e Aura Sphere em prévia passam a ter duração visual **3,4 vezes a duração básica**, mantendo quadros e tamanho da V78. Dano, tempo de cast, recarga e energia permanecem inalterados. A versão de teste é ativada apenas por `?battle_preview=v79`.
- O sinal positivo **+ vetorial SVG, sem emoji**, deve aparecer ao lado do **nome** (também durante combate) de todo golpe com efeito visual especial já alterado. Verificar explicitamente `Chamas de Moltres` e seus vizinhos `Rajada Flamejante`, `Chama Circular`, `Garra de Fogo`, bem como os aliases/familias de fogo, status e elétricos editados.
- O marcador indica que **a arte foi modificada**, não equivale a aprovação formal. Atualizar a lista do `effects/ui/move-library-v61.js` quando outro golpe ganhar renderizador específico e jamais apagar marcas aprovadas.

## Padrão V78 — marcador positivo nos golpes modificados

- Ao lado dos nomes dos golpes com **efeitos visuais já modificados**, exibir um pequeno **+ vetorial SVG**, com mesmo estilo do ícone de tipo, **não um emoji**. Ele identifica a alteração visual, não significa automaticamente aprovação. Não marcar os golpes genéricos ainda não trabalhados. Aplicar às listas de movimentos, slots equipados e comandos de batalha, sem alterar identificação dos golpes, seletores, salvamentos ou status.
- Manter a lista de golpes alterados em `effects/ui/move-library-v61.js` sincronizada com o catálogo `protected`, o repertório V66 e aprovações registradas, acrescentando IDs quando novos efeitos forem produzidos.
- **Dragon Claw e X-Scissor estão aprovados na V77**; usar seus quadros V77 também no combate normal e não mexer em sua arte.
- **Dragon Pulse e Aura Sphere V78 são apenas prévias de batalha em `?battle_preview=v78`** até aprovação; versões normais desses dois continuam na V75.
- Para ataques especiais, o movimento **não pode parecer um vídeo inteiro colado**: separar fonte/concentração, projétil avançando e impacto/explosão como quadros raster *realmente distintos*, com PixiJS para reproduzir.

## Revisão obrigatória V76 — prévias de combate no GitHub (sem Ateliê)

- A pedido do usuário, **não instalar nem abrir Ateliê/modal dentro do jogo**. Os arquivos de galeria podem permanecer no GitHub como arquivos históricos ou ferramentas externas; não devem ser injetados na interface.
- Para cada lote de **4 golpes**, entregar uma **versão testável em combate no site do GitHub Pages**. O fluxo atual usa `?battle_preview=v76`, que ativa novas animações **somente na URL de teste**, mantendo o render oficial anterior quando não houver o parâmetro. Não promover as novas artes para todo o jogo sem aprovação.
- **Staging quadro a quadro obrigatório**: preparação, contato e intervalos reais, cortes separados, rastro e dissipação. Dragon Claw deve primeiro impactar e só então mostrar garra 1, garra 2 e garra 3 em momentos distintos. X-Scissor deve ter dois cortes com um intervalo.
- Manter o visual cinematográfico e sólido aprovado (artes de `effects/atelier-v71/atlases` convertidas nos atlas de batalha V72), o tamanho compacto V74 e o playback mais lento V75. **PixiJS** reproduz os sprites, podendo usar máscaras apenas para revelar partes, nunca voltar a desenhar o golpe genericamente via Canvas/CSS.
- Preservar golpes aprovados e, em especial, **Thunder, Discharge e Thunder Wave**, além de mecânica, acerto, dano, cooldown, status e salvamentos.
- O usuário quer **link executável para ver na batalha**, e não nova imagem estática nem mera proposta de código; testar carregamento, visual e inicialização antes de declarar a publicação concluída.
