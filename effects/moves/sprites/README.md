# LibreSprite · spritesheet de efeitos

O jogo utiliza o atlas Diamond/Pearl já disponibilizado pelo usuário em `parts/p013.txt` através dos quadros `spriteFrames3511` e imagem `spriteAtlas3511`. `pixi-layer.js` converte cada quadro em textura real `PIXI.Texture` animada via `PIXI.AnimatedSprite`; as partículas são `PIXI.particles.Emitter`.

O PNG fonte é compatível com LibreSprite para edição e exportação. Exemplo de comando num ambiente com LibreSprite instalado: `libresprite -b efeitos.ase --sheet efeitos.png --data efeitos.json`. LibreSprite **não está instalado neste ambiente**, portanto não afirmamos que os quadros tenham sido produzidos nele neste patch. Não há nenhum efeito gerado por CSS.
