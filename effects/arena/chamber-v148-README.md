# Pokémon Torre V148 — câmara azul 2.5D
Referência de direção de arte: vídeo enviado pelo usuário do jogo PokéSouls.

Esta é uma **prévia visual em batalha**, não a reprodução de código/modelos 3D
do vídeo de terceiros. A renderização do cenário é pré-calculada uma vez,
enquanto os ataques continuam em PixiJS/WebGL. Nenhuma arte de golpe é
desenhada com Python, CSS ou Canvas.

Implementação:
- Geometria projetada dos ladrilhos: frente maior, fundo menor, linhas que
  convergem com profundidade; o original V97 não é sobrescrito.
- Paredes de pedra com faces e topo reais em 2.5D, platôs em degraus e sombras.
- Quatro cristais com faces de volume, reflexão suave e sombra do objeto.
- Fissuras emissivas nas pedras, luminárias integradas, névoa e oclusão.
- Versão alternativa vulcânica com rocha quente e fissuras alaranjadas.
- PixiJS conserva luz de ataques/sombras de contato, desliga a iluminação
  fixa exagerada da V146 para não estourar um único canto.
- Câmera V98 e a mecânica de colisão, hitbox, ataques, progressão e menus
  são preservadas.
- HUD do celular ligeiramente mais compacto, mantendo dados legíveis.

Controles:
- `?v=148`: câmara azul na batalha.
- `?arena148=lava&v=148`: tema de lava experimental.
- `?arena148=0&v=148`: volta à V147.
- `?lighting146=0&v=148` ou `?safe=1&v=148`: modo original.

Nota: piso/paredes foram pré-renderizados por Canvas2D (a tecnologia do
**cenário** existente), mas nenhum ataque/poder aprovado foi alterado.
A sensação de profundidade é 2.5D art-directed, não um modelo 3D que lança
sombras calculadas com ray tracing. FPS e percepção visual exigem teste
real no Android antes de aprovação final.
