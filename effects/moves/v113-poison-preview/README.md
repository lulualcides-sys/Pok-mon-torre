# V113 — prévia de sprites originais, não aprovada
Os quatro golpes EQUIPADOS no print de Mewtwo são Névoa Venenosa, Poison Jab, Ácido e Lama Corrosiva. Apenas em `?battle_preview=poison113`, nunca no jogo normal até aprovação explícita do usuário.

Fonte principal: `poison_attack_effects_ripped.png` da Biblioteca do usuário, cuja cópia idêntica está disponível em https://www.spriters-resource.com/ds_dsi/pokemonmysterydungeonexplorersoftimedarkness/asset/14793/ (rip por redblueyellow). SHA-256 esperado `edc356640969383f7fa1cfe19beda3051184c0bbe1fc77bb211de5846923d659`.

O repositório contém as poses recortadas do arquivo original da Biblioteca em `source/poison-original-crops.webp` (lossless WebP da seleção de pixels), sem acesso a sites externos. SHA-256 `041f779f700d71a475de78aa1b92342a040ff4e52d62314835bc0d67d836c964`. O build recorta pixels de **Acid**, **Poison Gas/Smog**, **Poison Jab** e **Gunk Shot** da folha. Gera quatro spritesheets lossless com 16 quadros únicos, sem desenhar formas por Pillow, SVG, CSS ou Canvas geométrico. A prévia usa PixiJS quando disponível e `drawImage` pixel-perfect no modo seguro.

A V112 anterior foi rejeitada visualmente. A V111, o registro de aprovados e os outros efeitos não são modificados. Não promover V113 sem aprovação visual em combate.
