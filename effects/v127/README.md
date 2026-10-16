# V127 — Registro separado de golpes e visto no catálogo

**Auditoria de 16/10/2026:** o V122 usava uma lista fixa de nomes (em `effects/ui/move-approved-mark-v122.js`), porém marcava apenas `skillMarkup` durante a batalha. O painel V33.1 gera seus próprios botões `.v331Choice` e `.v331Slot`, por isso os vistos faltavam na tela de edição. A lista V122 também estava incompleta em relação ao histórico.

**Correção:**
- `effects/v127/edited-moves.json`: relação única de 62 golpes editados/registrados e aliases de inglês/português, sem confundir traduções e variantes.
- `effects/v127/by-move/<slug>/status.json`: **62 fichas independentes**, cada uma informa o estado, aliases e a fonte do renderer. Essa separação é **de metadados e acompanhamento**. Renderers compartilhados continuam compartilhados; não afirmar que os 62 efeitos ganharam motores próprios nem mover animações aprovadas.
- **30 registros oficiais** de `effects/moves/STATUS_APROVADOS.json`, entre aprovados, salvos, provisórios e quatro em teste (Cross Chop, Chute, Golpe de Karatê e Brick Break).
- **32 entradas de histórico**, sem status de aprovação individual auditada; foram extraídas do marcador V122 mais lembranças documentadas sobre Chamas de Moltres, Soco de Fogo, Tsunami, Mordida, Thunder, Thunderbolt, Solar Beam, Hyper Beam, Dragon Claw, X-Scissor e Chicote em Área.
- **Marca gráfica não emoji:** `✓` para salvo/aprovado, `✓ EDITADO` azul para histórico ainda não validado individualmente, `TESTE` âmbar para efeitos em teste. Nenhuma marca em golpes desconhecidos.
- `effects/v127/approval-marks.js` insere ✓ no botão de batalha e substitui o antigo "+", sem ícones duplos.
- `parts/p008.txt` foi alterado **somente em duas expressões de montagem de HTML dos botões de editor V33.1**: lista dos 4 golpes equipados e catálogo de movimentos, usando a mesma marcação. Nada de lógica de dano, animação, save ou filtros alterada.
- A lista do editor mantém o `content-visibility:auto` aprovado em V126. Evitar observers globais, loops adicionais, consultas de rede, carregamento de dezenas de JSON em tempo de jogo e novo custo de Canvas.
- Rollback isolado `?marks127=0` (restaura os marcadores anteriores sem desativar os golpes).
- Teste `tests/v127-move-marks.test.cjs` valida 62 fichas, nomes antigos e aliases, botões de batalha/editor, distingue `TESTE`, não marca inventados e confirma que arquivos aprovados anteriores não foram editados.
- **V123–V126 e golpes aprovados preservados.** A V127 aguarda aprovação visual do usuário. A publicação tem de passar pelos testes e GitHub Pages antes de ser considerada concluída.
