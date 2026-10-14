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
2. **Mostrar prévia de dentro do próprio jogo** antes de considerar a alteração finalizada, com animação real/quadros representativos, conforme o padrão que o usuário aprovou. Prévia externa isolada não substitui a prévia integrada ao jogo.
3. Após aprovação, integrar a mudança ao jogo e ao repositório quando houver permissão de escrita.
4. Manter cada golpe em pasta/módulo isolado e evitar regressões nos outros efeitos aprovados.
5. Testar carregamento do jogo, exibição do efeito, acerto e dano, alinhamento, desempenho, e compatibilidade com o renderizador. Não afirmar que os testes passaram sem executá-los.
6. Organizar as pastas sem afetar o funcionamento e preservar salvamentos e conteúdo existente. Preferir atualizações no site já publicado, evitando downloads manuais a cada versão.

Estas são **diretrizes permanentes de desenvolvimento**, não uma declaração de que todos os golpes já foram refeitos ou testados.
