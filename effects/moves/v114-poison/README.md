# V114 — quatro golpes de Veneno aprovados

O usuário aprovou **Névoa Venenosa**, **Poison Jab** e **Ácido** da V113, pedindo que ficassem **apenas um pouco menores**, e autorizou salvar agora. As spritesheets originais de 16 quadros da V113 não são modificadas: na V114, apenas a escala visual é reduzida respectivamente em 11,8%, 10,7% e 11,1% na batalha normal.

A **Lama Corrosiva foi aprovada** em 16/10/2026: depois de testar a poça, o usuário respondeu **«Excelente»** ao pedido de aprovação. Sua spritesheet isolada mantém EXATAMENTE os pixels originais de Gunk Shot, transformados numa **poça rasa de lama animada** que se espalha no chão sob os pés do adversário. São 16 quadros, sem ImageDraw, CSS, SVG, círculos ou vídeos. O mesmo efeito previamente testado em `?battle_preview=poison114` passa a carregar na **batalha normal**, preservando os sprites e a posição sem qualquer retoque.

A fonte original está versionada em `effects/moves/v113-poison-preview/source/poison-original-crops.webp`; o build continua offline, com SHA256 verificado. Cada golpe tem sua pasta de registro na V114. Renderização: PixiJS quando possível; fallback pixel-perfect drawImage no modo seguro. O motor V359 continua dono exclusivo do dano, energia e recarga, e o Poison Jab continua com aproximação e recuo físicos.

V111, arena V98, gelo V101, lutador V110, prévias históricas V112/V113 e todos os efeitos aprovados continuam preservados. A V114 promove somente os quatro efeitos explicitamente aceitos. Todos estão marcados como protegidos.
