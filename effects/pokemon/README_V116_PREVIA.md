# V116 — sprites de batalha APROVADOS (tamanho / shiny / impacto)

O usuário aprovou o **acabamento V115** em 16/10/2026 e escolheu continuar nas melhorias **3, 4 e 5**: proporção por espécie, shinies e reação física ao sofrer dano. O usuário **aprovou a V116** em 16/10/2026: "Pode salvar ficou bom". O efeito é integrado na versão **oficial** com URL limpa. Mewtwo V95 e acabamento V115 continuam preservados. Comparação: `?pokemon_visual_preview=off` desliga só o V116; `?pokemon_polish=off` desliga V115 e V116.

1. **Escala de sprites por espécie**, conservadora (0,865 / 1 / 1,115 / 1,27), com os pés fixos, para que Pikachu apareça menor que Onix. São classes estéticas para a arena, não o tamanho exato em metros. Não modifica raio, caixa de colisão, HP nem movimentos.
2. **Shinies:** reutiliza somente sprites/paletas originais já integrados; foi confirmada no jogo uma coleção com folhas de Idle/Walk/Attack/Hurt para os IDs 18, 6, 94, 105, 62 e 68. Nenhuma recoloração artificial das demais espécies. Ao entrar na batalha, as estrelas *já existentes no jogo* têm duração limitada a aproximadamente 1,5 segundo.
3. **Reação ao dano:** pequeno recuo visual limitado a ~8px enquanto `actor.flash` está ativo, sem alterar a posição real do ator, trajetória, dano, hitbox, cooldown ou efeito de golpe.

O renderizador apenas intercepta o `drawImage` do Pokémon enquanto `drawMon` está sendo executado, preserva os sprites reais do jogo e desfaz qualquer intervenção após o quadro. **Não gera animação falsa, CSS, imagens de conceito ou vídeo.**

Fonte disponível: projetos históricos de sprites animados de 8 direções e versões com shinies protegidos. Não se afirma que toda espécie já tenha sprites próprios em cada direção. Esses arquivos serão aproveitados em vez de ser recriados.

**Aprovação:** V115 protegida; V116 aprovada e promovida ao jogo oficial sem modificar os sprites nem as animações aprovadas.
