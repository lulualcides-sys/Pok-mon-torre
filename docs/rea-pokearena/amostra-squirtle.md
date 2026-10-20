# Poké Arena 2D — auditoria pública de sistema visual

Perfil: squirtle. Arena solicitada pela automação: Crater.

Esta é uma coleta técnica da interface pública. Não representa acesso irrestrito a conteúdo bloqueado ou privado.

## Inventário observado
- JavaScript descoberto: 0; analisado como AST: 0
- Atlases com dimensões detectadas: 0
- Referências a recursos gráficos/áudio: 0
- Nomes candidatos de movimentos (heurística, requer revisão): 0
- Pastas de efeitos no Pokémon Torre: 0

## Dados de spritesheets detectados
| Chave | Frame | Colunas | Animações e FPS |
|---|---:|---:|---|

## Fontes e cenas observadas

## Testes de cinco comandos por Pokémon
- left: 12 de 12 quadros com mudança visível. Não comprova qual habilidade ativou.
- right: 7 de 12 quadros com mudança visível. Não comprova qual habilidade ativou.
- Space: 12 de 12 quadros com mudança visível. Não comprova qual habilidade ativou.
- q: 9 de 12 quadros com mudança visível. Não comprova qual habilidade ativou.
- e: 12 de 12 quadros com mudança visível. Não comprova qual habilidade ativou.

## Restrições
- Aprovação visual e gameplay precisam ser checadas, mesmo quando a análise AST encontra um registro.
- Conteúdo de modos online, contas ou desbloqueios não é coberto.
- O REA fornece evidências passivas; este script auxilia a navegação para observar o jogo.
- Não foram incorporados arquivos ou código de terceiros ao Pokémon Torre.
- Implementar equivalentes autorais no PixiJS/WebGL, comparar impacto e manter golpes aprovados intactos.

Arquivos: INVENTARIO-GERAL.json (perfil bulbasaur), survey.json, frames/, rea-inspect.json, rea-bundle.json.