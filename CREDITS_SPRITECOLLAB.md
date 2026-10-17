# Créditos — PMD SpriteCollab

Pokémon Torre é um **projeto de fã, gratuito e não comercial**. O catálogo de animações de Pokémon utilizado no projeto pode incluir material produzido pelos colaboradores do **PMD SpriteCollab**.

**Origem:** https://github.com/PMDCollab/SpriteCollab
**Licença declarada pelo repositório:** [Creative Commons Attribution–NonCommercial 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
**Autores e créditos individuais:** consultar os registros mantidos no repositório de origem, incluindo [credit_names.txt](https://github.com/PMDCollab/SpriteCollab/blob/master/credit_names.txt) e [spritebot_credits.txt](https://github.com/PMDCollab/SpriteCollab/blob/master/spritebot_credits.txt).

Esta é uma atribuição ao repositório; quando as spritesheets usadas forem selecionadas, devemos também atribuir seus **criadores individuais** conforme as informações fornecidas pelo projeto. Créditos de terceiros devem ser preservados, e qualquer modificação deve ser identificada. O SpriteCollab não patrocina nem endossa o Pokémon Torre.

O uso não comercial e a atribuição são exigidos pela licença. Ela não libera automaticamente direitos da franquia Pokémon detidos por terceiros.

## Importação seletiva

O jogo já possui um carregador de sprites PMDCollab. O script \`tools/import_pmd_spritecollab.py\` permite armazenar localmente animacões específicas para melhorar estabilidade:

\`\`\`bash
python tools/import_pmd_spritecollab.py --pokemon 150 151
\`\`\`

A opção \`--all\` importa incrementalmente os Pokémon 1–151 para o repositório de trabalho, mas **não** obriga o jogo a carregar todo o acervo na inicialização. Evitar pré-carregar centenas de spritesheets em dispositivos móveis.

Antes de disponibilizar a biblioteca inteira ou comercializar qualquer versão futura, revisar as licenças, autoria e outros direitos.
