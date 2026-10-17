# FlameTower — controle de qualidade visual

## V168 REPROVADA — 17/10/2026

O usuário rejeitou explicitamente as animações de **Flame Tower, Lança-Chamas, Fire Blast e Soco de Fogo** da V168 e também a imagem de sprites gerada na tentativa seguinte.

**Não marcar estes efeitos como aprovados nem reutilizar o gerador `tools/build-v168-flametower.py` como base estética para novos golpes.** A V168 continua somente como histórico experimental isolado.

### Defeito identificado e confirmado no código
- O builder V168 desenha chamas com `ImageDraw.polygon`, círculos, linhas e fórmulas procedurais.
- Esse método produz chama rígida, serrilhados triangulares repetidos e aparência artificial, visível nos screenshots fornecidos pelo usuário.
- Embora 32/24 quadros sejam reais e os testes de carregamento tenham passado, isso **não valida** beleza nem semelhança com a arte cinematográfica das referências.
- A imagem posterior não é um spritesheet de batalha aprovado. Não usar como entrega final.

### Próximo trabalho de arte
- Usar frames de arte **realmente desenhados**, orientados por referência de vídeo, com evolução orgânica de forma e contornos de pixel.
- Conferir quadro a quadro em **batalha real**, primeiro em um único golpe (Flame Tower), antes de propagar o estilo aos demais.
- Sem aceitar efeito por contagem de quadros, FPS, teste de CI ou descrição.
- Preservar todos os golpes aprovados e a campanha original; não inserir ilustrações, galerias ou ateliê como substitutos de jogo.

Este arquivo serve apenas para registrar a reprovação e evitar reincidência; ele **não constitui uma nova animação**.
