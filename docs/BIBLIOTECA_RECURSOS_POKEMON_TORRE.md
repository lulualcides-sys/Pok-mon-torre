# Biblioteca de recursos — Pokémon Torre

Cadastro em 2026-10-17 a pedido do usuário. Esta biblioteca preserva **as fontes e suas referências**, sem incorporar automaticamente todos os arquivos nem alterar sprites/golpes aprovados.

## 1. PMD SpriteCollab — personagens animados

- **Catálogo:** https://sprites.pmdcollab.org/
- **Repositório:** https://github.com/PMDCollab/SpriteCollab
- **Função no Torre:** sprites animados de Pokémon (Idle, Walk, Attack, Shoot, Hurt, Faint etc.), direções, quadros e metadados AnimData.xml. Referência prioritária para movimentação e coreografia de ataque.
- **Status:** aprovado como fonte permanente; importação seletiva de Mew/Mewtwo já usada em prévia V156, a generalização requer testes.
- **Licença e créditos:** contribuições disponibilizadas em CC BY-NC 4.0; creditar autores individuais e indicar adaptações. Consultar LICENSE.md, arquivos de crédito e CREDITS_SPRITECOLLAB.md. Direitos de terceiros sobre material oficial podem subsistir.

## 2. PMDCollab RawAsset — efeitos de combate e material de estudo

- **Repositório:** https://github.com/PMDCollab/RawAsset
- **Função no Torre:** referências técnicas/visuais de partículas, feixes, explosões, padrões e arte de combate no estilo Mystery Dungeon.
- **Status:** cadastrado para curadoria, adaptação e criação de spritesheets cinematográficas.
- **Licença e créditos:** **verificar licença/autoria de cada arquivo** antes de incluir seus bytes no jogo; não presumir a licença do SpriteCollab para este repositório.

## 3. Team Aqua's Asset Repo — cenários e tilesets

- **Repositório:** https://github.com/TeamAquasHideout/Team-Aquas-Asset-Repo
- **Pastas úteis:** Tilesets/, Battle Backgrounds/, Battle effects/, Overworld Pokemon Sprites/, User Interface/.
- **Função no Torre:** materiais de pedra, paredes, cristais, ambientação, detalhes de arena 2.5D, sprites e efeitos auxiliares.
- **Status:** cadastrado como fonte para seleção e atribuição, sem inserir automaticamente assets.
- **Licença e créditos:** repositório descreve assets geralmente gratuitos para uso/edição, com exceções individuais; seguir READMEs por artista, regras de cada pasta e créditos. Gratuidades não equivalem a licença irrestrita.

## Processo de uso no Pokémon Torre

1. Localizar o recurso adequado ao Pokémon, golpe ou arena solicitada e registrar caminho de origem, autor e licença.
2. Selecionar material compatível com fangame gratuito e não comercial; respeitar restrições de obras oficiais/terceiros.
3. Importar somente o necessário, preferindo arte pixelada e animação por quadros reais via PixiJS/WebGL; usar LibreSprite ou Python/Pillow para preparar material autorizado.
4. Testar carregamento e FPS no Android, dano/impacto sincronizado e arquivo isolado de cada golpe.
5. Preservar `effects/moves/STATUS_APROVADOS.json`, a campanha, salvamentos e versões já aprovadas.

Este registro **não** é uma importação total dos três acervos; é o catálogo de referências aprovado para pesquisa e futuras incorporações.
