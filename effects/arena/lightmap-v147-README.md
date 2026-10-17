# Pokémon Torre — V147 mapa iluminado, não um overlay

Este estágio corrige o visual V146 criticado pelo usuário como um único brilho
no canto. A arena V97 continua sendo a fonte das texturas, ladrilhos,
medalhões, escadas, grades e colisões.

**O que mudou:** O lightmap da arena é gerado UMA vez em segundo plano ao
gerar o backdrop V97, sem processamento por quadro. Ele combina ambient
escuro real no piso, gradientes no rosto das paredes, sombra projetada
das estruturas, luminárias ciano/âmbar embutidas na arquitetura, e brilho
especular nas bordas dos próprios ladrilhos. Não troca os sprites nem
cria formas genéricas para ataques.

**PixiJS:** O antigo V146 continua somente com sombras de contato e
luz de golpes na camada WebGL. Seu brilho está reduzido ao mínimo quando
o lightmap V147 está ativo, evitando clarear um canto aleatório.

**Performance:** Sem shader pesado de tela toda nem novos contextos WebGL.
A composição estática herda o cache de V97 e não depende de FPS; o
Pixi só atualiza pequenas luzes dinâmicas durante o combate.

**Rollback:** \`?lightmap147=0\` recupera apenas a V146;
\`?lighting146=0\` desliga V147 + V146.
\`?safe=1\` mantém a arena sem alterações.

A iluminação aproximada do vídeo é uma direção de arte 2.5D com luz estática
e luz dinâmica, e não ray tracing/3D. Exige validação visual no Android.
