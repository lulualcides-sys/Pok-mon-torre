# V114 — três Veneno aprovados + Lama Corrosiva em prévia

O usuário aprovou **Névoa Venenosa**, **Poison Jab** e **Ácido** da V113, pedindo que ficassem **apenas um pouco menores**, e autorizou salvar agora. As spritesheets originais de 16 quadros da V113 não são modificadas: na V114, apenas a escala visual é reduzida respectivamente em 11,8%, 10,7% e 11,1% na batalha normal.

A **Lama Corrosiva** não está aprovada. Em `?battle_preview=poison114`, sua nova spritesheet isolada é composta EXCLUSIVAMENTE dos pixels de Gunk Shot da galeria original, transformados em uma **poça rasa de lama** que se espalha no chão sob os pés do adversário. A animação tem 16 quadros, não usa ImageDraw, CSS, SVG, círculos ou vídeos. Este golpe continua com visual antigo no jogo normal, até autorização explícita.

A fonte original está versionada em `effects/moves/v113-poison-preview/source/poison-original-crops.webp`; o build continua offline, com SHA256 verificado. Cada golpe tem sua pasta de registro na V114. Renderização: PixiJS quando possível; fallback pixel-perfect drawImage no modo seguro. O motor V359 continua dono exclusivo do dano, energia e recarga, e o Poison Jab continua com aproximação e recuo físicos.

V111, arena V98, gelo V101, lutador V110, prévias históricas V112/V113 e todos os efeitos aprovados continuam preservados. A V114 só promove os três efeitos explicitamente aceitos.
