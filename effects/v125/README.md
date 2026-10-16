# Pokémon Torre V125 — Sprites de itens e TMs na PokéMart

Solicitação: substituir emojis da PokéMart (imagem enviada em 16/10/2026) por sprites oficiais de objetos Pokémon e discos TM, mantendo as animações e golpes previamente aprovados.

## Implementação
- Módulo `effects/v125/pokemart-sprites.js`, carregado após V124.2 no index oficial.
- 10 itens da loja: poção, superpoção, Pokébola, Super Ball (sprite de Great Ball), Ultra Ball, Leftovers, Quick Claw, Mystic Water, Charcoal e Focus Band.
- 10 TMs da loja: eléctrico, água, fogo, planta, psíquico, terra, normal, veneno, gelo e fantasma. Os discos são os sprites Gen5 `tm-[tipo].png` da PokéAPI.
- Os itens equipados nas fichas Pokémon passam a exibir miniatura original quando estão visíveis. Nenhum item é adicionado, removido ou comprado automaticamente.
- `showShop` existente continua construindo a loja, e o módulo altera apenas os nós visuais `.shopEmoji` após renderizar. Nenhum evento de compra é substituído; preços, moedas, TM já adquirida, mochila, salvamento e compras não mudam.
- CSS de pixel art, carregamento preguiçoso (`loading=lazy`), ícone emoji original como fallback quando rede/arquivo falhar. Não aumenta o trabalho do motor de batalha.
- Fonte verificada: <https://github.com/PokeAPI/sprites/tree/master/sprites/items/gen5>; caminho das imagens `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/gen5/NOME.png`. Todos os 20 nomes conferidos no repositório upstream. O repositório de sprites declara **conteúdo visual © The Pokémon Company** em seu arquivo LICENCE.txt. **Os sprites são externos e dependem de conectividade/CDN; o jogo não armazena nem redistribui cópia binária.**
- Diagnóstico/rollback isolado: `?mart125=0` mantém os ícones anteriores, sem alterar V123/V124.
- Não gera PNGs genéricos, ilustrações nem sprites de golpes. V123 e V124.2 aprovadas continuam protegidas.

Teste automatizado: `tests/v125-pokemart-sprites.test.cjs` verifica 20 IDs, mapeamento de TMs, renderização sem duplicações, itens equipados, fallback, loja e V124/V123 preservados.

A V125 aguarda aprovação visual do usuário no celular após CI+GitHub Pages.

## Aprovação do usuário (16/10/2026)

**V125 aprovada:** “Aprovado, quero aumentar a quantidade de treinador…”. Registrar a aprovação da PokéMart/itens/TMs em `effects/v125/STATUS_APROVACAO.json` e preservar os sprites, preços, funcionamento e fallback. A V126 tratará somente da progressão de treinadores, abertura do editor pelos cartões, emojis atrás dos Pokémon e performance. Não modificar esta implementação sem novo pedido.
