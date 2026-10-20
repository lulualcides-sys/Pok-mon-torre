# Engenharia reversa pública do Poké Arena 2D — REA

Coleta técnica para comparação de recursos e reconstrução de animações autorais
no Pokémon Torre com PixiJS/WebGL. Este diretório contém apenas
metadados, nomes, medições e amostras de comportamento, não o
código-fonte, sprites, sons ou outros recursos originais de terceiros.

- INVENTARIO-GERAL.json: arquivos JavaScript públicos, registros de atlas,
  frames, nomes candidatos e recursos observados pelo navegador.
- amostra-<pokemon>.json: testes de controles e mudanças visuais por frame.
- amostra-<pokemon>.md: relatório por Pokémon e arena.

Escopo: quatro personagens acessíveis sem login (Bulbasaur, Charmander,
Squirtle e Pichu), quatro arenas (Stadium, Neon, Crater, Ruins), cinco
comandos por personagem e levantamento estático das referências
observáveis. Não afirmar que todos os Pokémon/ataques do jogo foram
observados funcionando. Conteúdo bloqueado, online e progressão
não foram acessados.

Registro de aprovação de movimentos do Torre: effects/moves/STATUS_APROVADOS.json.
Não sobrescrever efeitos protegidos automaticamente.
