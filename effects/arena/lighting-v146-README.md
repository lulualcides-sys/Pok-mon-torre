# V146 — Luz cinematográfica (Pokémon Torre)

Referência: vídeo enviado de PokéSouls com cavernas azuis, cristais e fogo.

## Alteração
- O estádio V97 e a câmera V98 permanecem sem modificação.
- A camada WebGL PixiJS já existente nos golpes agora também sustenta luz.
- Luz ambiente azul-marinho sombreia discretamente o cenário sem apagar tiles.
- Dois pontos quentes seguem lâmpadas da arena. Reflexos frios nas laterais,
  emissão vermelha na escadaria e linhas luminosas estruturais.
- Duas sombras de contato acompanham os Pokémon sem círculos permanentes.
- O último golpe nativo gera luz temporária com cor vinculada ao tipo.
- Não muda acerto, dano, energia, posição, tempo de golpe ou registro aprovado.

## Engenharia e desempenho
- Um só contexto WebGL: nenhum PIXI.Application adicional.
- Um gradiente 64x64 na memória, compartilhado por todas as luzes; usado apenas
  como máscara de ILUMINAÇÃO, não como arte de golpe. Sem Canvas 2D ou Python
  para iluminação e sem bloom pesado em resolução de tela inteira.
- Atualização dos pontos de luz limitada a 30 Hz; Pixi usa câmera V98
  e recorte do próprio canvas. A sobreposição existe só na batalha.
- Fora de WebGL o estádio antigo permanece ativo.
- Desativar: ?lighting146=0 (ou ?safe=1). O mapa anterior está intacto.

Este trabalho aproxima a atmosfera do vídeo, sem representar normais físicas
por tile ou projeção geométrica de sombras de luz dinâmica. Testes de sensação
visual e FPS no Android devem acontecer antes de aprovação definitiva.
