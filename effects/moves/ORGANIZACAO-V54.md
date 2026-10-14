# Organização dos golpes — Pokémon Torre V54

**Regra de estabilidade:** esta melhoria organiza a manutenção; não move arquivos que o jogo carrega, não troca efeitos aprovados e não altera HP, colisão, recarga, energia, câmera ou movimentação. Os 25 fragmentos originais `parts/` permanecem intocados.

## Onde encontrar os golpes

| Tipo | Local atual | Orientação |
|---|---|---|
| Elétrico | `effects/moves/faisca/`, `discharge/`, `tempestade-de-raios/`, `trovao/` | Cada pasta tem `index.js`, `move.json`, `sprites/` e `impact/`; Discharge também tem `arcs/` |
| Fogo e água | `effects/moves/<golpe>/` | Mantidos no caminho já usado pelo jogo |
| Outros golpes | `effects/moves/catalog/<golpe>/index.js` | Consulte `effects/moves/catalog/manifest.json`; não alterar `bundle.js` sem atualizar catálogo |
| Runtime | `effects/moves/_runtime/` | Código compartilhado de renderização e integração; alterar exige avaliação de regressão |
| Diretório central | `effects/moves/registry.json` | Liga tipo → configuração de golpe sem executar código |
| Referência dos elétricos | `effects/moves/<golpe>/move.json` | Nome, duração visual, frames, impactos e arquivos extras |

**Importante:** `move.json` e `registry.json` são metadados para localizar/validar os golpes; **não são carregadores automáticos no jogo**. O `index.html` continua carregando os módulos existentes, sem mudança nesta versão. Qualquer mudança futura de pasta exige atualizar o loader, testes e compatibilidade; por padrão, não mover.

## Como atualizar apenas um golpe

1. Buscar pelo ID em `registry.json` ou no manifesto do catálogo.
2. Editar somente o `index.js`/arte na pasta daquele golpe. Não tocar nos outros golpes.
3. Para regeneração de arte elétrica, usar `python tools/build_electric_v53.py --move discharge` (também aceita `faisca`, `tempestade-de-raios` e `trovao`). Sem argumento, gera tudo; **não usar tudo por padrão**.
4. Validar somente o golpe: `node tools/check-move-assets.cjs --move=discharge`.
5. Integrar a alteração em uma branch e publicar uma única vez. Não fazer vários commits ou gerações simultâneas na mesma branch.
6. Se o problema afetar a lógica de dano ou o runtime comum, fazer regressão completa antes do merge.

Também existe o fluxo **Gerar sprites de apenas um golpe**, acionado sob demanda em uma branch de trabalho e protegido contra execuções simultâneas na mesma branch. Nunca grava diretamente na `main`.

## Estratégia de testes

| Situação | Verificação |
|---|---|
| Edição em pasta de golpe | `moves-fast.yml`, verifica catálogo + arquivos do golpe alterado |
| Alteração no runtime comum | Validação rápida de todos os quatro elétricos; revisão adicional de integração |
| Mudança em `index.html`, `parts/` ou renderizador central | Chrome real em PR pelo `browser-boot.yml` |
| Investigação de bugs visuais/dano, release importante | Executar manualmente a suíte elétrica e/ou fogo/água e Chrome |
| Merge em `main` | GitHub Pages publica automaticamente, sem aguardar testes caros duplicados |

**Não ignorar bugs:** a verificação rápida detecta caminhos quebrados, manifestos inconsistentes, frames ausentes e arquivos PNG inválidos, mas não substitui validação visual em batalha. Quando houver relato de erro, executar a suíte correspondente e corrigir antes de considerar aprovado.

Os geradores das versões V50/V51/V52 foram mantidos em `tools/` somente como histórico técnico. Os workflows antigos ligados às branches históricas foram removidos. A ferramenta atual para os quatro elétricos é `tools/build_electric_v53.py` com `--move`.

## Padrão visual

Não inserir prévia no jogo. Golpes precisam manter identidade, frames animados de verdade, impacto no alvo, contornos controlados e nenhuma imagem única parada como ataque completo. O projeto usa os sprites renderizados e efeitos da camada de jogo já existente; a organização V54 não altera essa arquitetura em produção.
