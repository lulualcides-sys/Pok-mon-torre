# V122 — APROVADA E OFICIAL (16/10/2026)

O usuário declarou: “Aprovada a 121 e a 122 volta de onde parou”. Os quatro efeitos funcionais **Venoshock, Toxina Pesada, Rajada Ácida e Golpe de Veneno** foram autorizados e passam a carregar na **batalha normal sem parâmetros especiais**. Cada um conserva 16 quadros PMD, estrutura isolada, cronograma nativo de HP/dano, energia e cooldown. Os marcadores `+` incluem os quatro efeitos aprovados.

Os 4 módulos antigos V111 continuam armazenados intactos. **Venoshock V111** pode ser visualizado na versão de contingência `?poison122=0`; Picada Tóxica, Picada Venenosa e Ferrão Venenoso preservam os visuais V111. A URL antiga `?battle_preview=poison122` segue compatível, mas não é mais necessária. O modo seguro normal continua disponível com `?safe=1`. A aprovação não altera outros golpes, a arena V98 ou os arquivos V120 e V121.

**Jogo oficial:** https://lulualcides-sys.github.io/Pok-mon-torre/

---

## Histórico V122 (pré-aprovação)

# V122 — Golpes Veneno / Arena Android / estabilidade (prévia inicial, 16/10/2026)

## Alterações
- **Oficiais e reversíveis:** `effects/ui/battle-proportion-v122.js` amplia a arena no retrato, melhora a distribuição dos HUDs, aumenta discretamente o desenho dos Pokémon (sem modificar sprites nem hitboxes) e cria controle **⛶ Deitado**. Em modo paisagem usa duas colunas e controles refluídos. Quando a rotação programática é bloqueada pelo navegador, orienta a girar fisicamente. Não promete forçar orientação Android.
- **Oficial:** `effects/performance/cast-smooth-v122.js` limita somente explosões de partículas genéricas; observa duração de uso dos golpes e tempo de cada frame, pede decodificação antecipada *assíncrona* de imagens já carregadas. Não altera a física, dano, sprites aprovados, energia ou cooldown. Sem promessa de 60 FPS em qualquer celular.
- **Oficial:** `effects/ui/move-approved-mark-v122.js` exibe um sinal `+` tipográfico (não emoji) apenas nos golpes que foram marcados como salvos ou aprovados anteriormente, a partir de `STATUS_APROVADOS.json` e da lista histórica de golpes protegidos, excluindo os quatro que constam como `em_teste`. Durante a prévia, os quatro novos efeitos não são marcados como aprovados.
- **Somente prévia até aprovação visual do usuário:** `effects/moves/v122-poison-preview` contém **quatro efeitos funcionais e isolados**: Venoshock (duplo choque), Toxina Pesada (nuvem densa), Rajada Ácida (três jatos) e Golpe de Veneno (contato). Cada um usa **16 quadros reais da galeria Pokémon Mystery Dungeon V113**, por meio das spritesheets reais do repositório; sem CSS falso, vídeo, imagens ilustrativas ou alterações das spritesheets aprovadas. O V359 continua dono do impacto HP, energia e recarga. O v122 substitui os visuais dos quatro somente quando `?battle_preview=poison122` estiver ativo.

## Links
- Jogo oficial, com layout e performance melhorados: `https://lulualcides-sys.github.io/Pok-mon-torre/`
- Prévia dos 4 golpes na batalha real: `https://lulualcides-sys.github.io/Pok-mon-torre/?battle_preview=poison122`
- Modo seguro da prévia: `https://lulualcides-sys.github.io/Pok-mon-torre/?battle_preview=poison122&safe=1`

## Qualidade e proteção
Não edita `STATUS_APROVADOS.json` nem outros efeitos aprovados. Nenhum dos quatro novos visuais é registrado como aprovado até o usuário gostar da animação na prévia. `?battle_preview=poison122` não abre Ateliê, não modifica salvamentos, não desenha imagem estática ou quadros falsos. Os testes verificam tanto os quatro movimentos em batalha como a área do canvas e layout deitado com Chromium mobile.
