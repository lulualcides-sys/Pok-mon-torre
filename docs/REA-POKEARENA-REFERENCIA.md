# REA — Poké Arena 2D: observação de batalha e golpes de fogo

**Fonte analisada:** https://www.pokearena2d.com/
**Ferramenta:** REA (CDP + bundle analysis), com Playwright controlando somente a interface pública no navegador isolado.
**Execução com evidência dos dois golpes:** https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39402580908
**Ramificação de análise:** `rea-pokearena-battle-v2`
**Segurança do jogo:** nada foi modificado em arquivos de jogo ou golpes aprovados; esta análise não atualiza GitHub Pages.

## Fluxo reproduzido

1. Abrir página inicial (780×437).
2. Clicar Play e abrir menu de modos.
3. Selecionar Training.
4. Selecionar Charmander e Pikachu como Dummy.
5. Iniciar com Fight!.
6. Manter RMB durante a animação de Flamethrower; iniciar Fire Blast com a tecla E após golpes de carga.
7. Salvar capturas de quadros, informações de recursos, verificação de scripts e evidência REA.

As capturas mostram **Flamethrower ativo** como fluxo de chamas com partículas, e **Fire Blast ativo** com escurecimento temporário da tela, explosão em área próxima ao alvo, texto indicativo e redução da barra de HP (Pikachu: 91 para 68 na amostragem visível).

## Código observado (somente módulos publicamente servidos pelo site)

- Motor: biblioteca `lib/phaser.min.js` carregada pelo site. **Não foi comprovado qual backend de renderização está ativo**.
- `src-582c990074/vfx.js` (30.898 caracteres, no momento da coleta): registra spritesheets e animações.
- Flamethrower: folha com quadros de **112×64**, **2 colunas**, animação **14 FPS** com repetição; frames adicionais podem existir em outras linhas.
- Fire Blast: folha do projétil com quadros **53×53**, **2 colunas**, animação **10 FPS** com repetição.
- Fire Blast explosion: folha de impacto **112×112**, **4 colunas**, animação **16 FPS**.
- `src-582c990074/habilidades.js`: usa funções de sprites de VFX e combinadores como profundidade (depth), blending aditivo, tweens e partículas. Possui código que gera efeitos em texturas Canvas internamente.
- `src-582c990074/arena.js`: organiza a arena e utiliza texturas, camadas e tweens; **não é prova de um jogo 3D**.
- `src-582c990074/controles.js`: mapeia LMB, RMB, Space, Q, E; a captura do menu de combate associa esses controles aos cinco golpes de Charmander.
- Hashes e trechos muito curtos para rastreabilidade: `code-signatures.json` no artefato da execução.

## Aplicação proposta no Pokémon Torre

Manter **PixiJS/WebGL**, sem introduzir Canvas 2D como renderizador nem substituir golpes aprovados. Reproduzir os *princípios*, não os arquivos de arte de terceiros:

1. Criar spritesheets **autorais** com 8, 12 ou 16 quadros conforme complexidade, via LibreSprite.
2. Flamethrower: fluxo contínuo articulado (frame animation em loop), nascendo da boca e orientado ao inimigo; partículas pequenas deslocam-se com a chama; limitar comprimento e espessura em relação à arena.
3. Fire Blast: separar projétil principal e explosão de impacto; animar os dois em instâncias distintas e disparar dano no momento do contato.
4. Usar `PIXI.AnimatedSprite`, camadas `zIndex`, partículas limitadas, glow discreto por blend aditivo e sincronização por eventos de impacto.
5. Reaproveitar texturas, evitar novos objetos por frame, interromper animações após o fim do combate, preservar FPS.
6. Construir prévias em batalha em lotes pequenos; comparar vários quadros visuais e efeito de dano antes de marcar cada golpe aprovado.

## Limites e rastreabilidade

- Estes FPS e tamanhos são propriedades de atlas do código observado, **não** uma medição de FPS geral do jogo.
- Capturas de imagens em arquivos de evidência são documentação; não devem ser copiadas como PNG estático para renderizar golpes no Pokémon Torre.
- A simples existência de scripts não revela toda a lógica do jogo; a fonte serve de base para inspeção e implementação autoral.
- Artefato da execução expira conforme retenção do GitHub Actions; guardar conclusões neste documento.

**Próximo desenvolvimento:** prototipar Flamethrower e Fire Blast com spritesheets autorais no motor PixiJS do Pokémon Torre em ramo de testes, revisar STATUS_APROVADOS.json antes de substituir qualquer animação aprovada e medir sincronização de dano/FPS em batalha.
