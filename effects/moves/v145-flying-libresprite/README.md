# V145 - Quatro golpes com LibreSprite

**Previa funcional para Bico Broca, Vendaval, Aerocorte e Pique**, ainda nao marcada como aprovada.

Cada golpe tem um arquivo animado independente animation.aseprite com 16 quadros
editaveis, de 128 x 128 pixels, exportados por LibreSprite 1.3 na compilacao.

As imagens originais vieram da Biblioteca de Sprites fornecida pelo usuario:
pixel_fx_sheet_blue_background.png (ar, espirais e avancos),
full_pixel_attack_fx_blue_background.png (laminas de ar) e
pokemon_ruby_sapphire_effects_neslug.png (tornado, credito: Neslug).

Quadros rearranjados a partir de sprites originais usando Node/Sharp apenas
para RECORTAR e posicionar pixels ja existentes. Nao ha arte desenhada por
Python, CSS ou Canvas 2D. Os arquivos .aseprite sao editaveis no LibreSprite.

Os PNGs finais sheet.png devem ser exportados via:
bash tools/libresprite/build-v145-flying.sh

Os golpes salvos da V143 nao sao alterados. Para voltar a V144, use
?flying145=0. Aprovar visual apenas apos avaliacao do usuario.
