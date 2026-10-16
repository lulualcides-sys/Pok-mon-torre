# Pokémon Torre — Proposta V117: Kanto Definitivo (NÃO IMPLEMENTADA)

Status: **planejamento proposto**, aguardando escolha e aprovação. A V116 foi aprovada em 16/10/2026. Nenhuma alteração visual da V117 está autorizada sem prévia.

## Objetivo
Uma atualização grande que transforme as batalhas e a progressão de Kanto, sem reconstruir a base funcional e sem alterar efeitos já aprovados.

## Pacotes, em ordem de execução

1. **Catálogo de 151 Pokémon (auditoria real de sprites)**: varrer os registros existentes de Idle/Walk/Attack/Hurt/Faint e direções, verificar os 151 IDs e documentar lacunas. Aproveitar sprites dos jogos/arquivos originais já fornecidos, priorizando material com licenciamento adequado; não supor que cada Pokémon possui 8 direções. Corrigir os faltantes por lote com prévia na batalha. Reutilizar V95/V115/V116 como aparência imutável.
2. **Shinies corretos por espécie**: inventariar imagens originais existentes (na revisão anterior: 18, 6, 94, 105, 62 e 68 com estados animados protegidos); criar controles de qualidade por espécie; nunca fazer recoloração aleatória dos demais. Manter estrelas de entrada 1,5 s, sem reaparecimento contínuo.
3. **Ginásios Kanto com identidade**: sequências de treinadores antes do líder, times fiéis, apresentação animada do líder, IA que recua, se aproxima e escolhe golpes adequados, e progresso/capturas já salvos. Ajustar dificuldade progressiva e manter single player.
4. **Combate visual e físico profissional**: resposta de dano específica por tipo de golpe, contato e recuo sem sobreposição, status congelamento/paralisia/sono com visuais próprios, melhor controle de ataque especial; não mexer nos golpes protegidos sem autorização.
5. **Desempenho e confiabilidade Android**: cache de sprites conforme necessidade, orçamento de partículas, controle DPR adaptativo com qualidade dos sprites preservada, checar FPS e memória, únicos loops, modo seguro e testes reais de entrada/saída de batalha, não declarar 60 FPS estáveis até medição real.

## Controle de qualidade e entregas
- Lotes de quatro com prévias funcionais na batalha **antes de aprovar substituições**, mantendo links isolados.
- Um módulo/pasta por espécie/feature para reduzir regressões; registrar aceitação e preservar `effects/moves/STATUS_APROVADOS.json`.
- Primeira entrega proposta: **painel interno de cobertura de sprites e 4 espécies piloto** + prévia de duas lutas de ginásio.
- Antes de publicar cada etapa: testes de inicialização, 4 ataques, Mewtwo V95, arena V98, shaders/Pixel sprites V115/V116, modo seguro/normal, cache e FPS. Publicação confirmada no GitHub Pages após CI.
- Não exigir downloads, comandos ou alterações manuais do usuário; aprovação visual do usuário para qualquer visual substituído.
