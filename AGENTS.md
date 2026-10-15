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
