# LibreSprite no Pokémon Torre

LibreSprite **v1.3** oficial, executado nos runners Linux do GitHub Actions.
O GitHub Pages é um site estático: o aplicativo de edição não pode ser instalado na página pública.

## Integração automática

- A action local .github/actions/setup-libresprite/action.yml disponibiliza o editor na publicação.
- O script tools/libresprite/install.sh baixa o AppImage oficial fixado pela versão 1.3, valida SHA-256, extrai sem FUSE nem sudo e exporta LIBRESPRITE_BIN.
- actions/cache mantém os recursos extraídos para execuções futuras do workflow.
- O teste tools/libresprite/smoke-test.sh abre o atlas original V144 e exporta PNG pelo **LibreSprite real**.
- O workflow .github/workflows/libresprite.yml permite validar o programa independentemente do deploy.

## Próximos golpes

Use sprites existentes como fonte principal, edite-os no LibreSprite, exporte spritesheets PNG e reproduza com PixiJS/WebGL.
Com a variável LIBRESPRITE_BIN, um exemplo de exportação é:

    "$LIBRESPRITE_BIN" --batch arquivo.ase --sheet spritesheet.png --data spritesheet.json

**Não gerar artes de golpes novos por Python ou CSS.** Os scripts Python antigos que geram efeitos já existentes no deploy foram preservados para não quebrar golpes aprovados.

LibreSprite oficial: https://github.com/LibreSprite/LibreSprite/releases/tag/v1.3
