# V117 Kanto Definitivo — PATCH ÚNICO (prévia integrada)

V117 cobre **1 a 5 em um só commit** e roda apenas com `?kanto117=1` até aprovação visual. O jogo oficial permanece na V116 aprovada. Scripts protegidos V95/V98/V101/V111–V116 e `effects/moves/STATUS_APROVADOS.json` não são alterados.

## O que está implementado

1. **151 registros auditados**: `sprite-audit.json` lista todos os IDs e as cinco animações previstas, com status estático "unverified" (nunca presumir imagens remotas disponíveis). O módulo `01-sprite-audit.js` acompanha imagens realmente decodificadas em batalhas, número de direções via metadados e fontes offline; carrega a folha *Faint* sob demanda para as espécies encontradas. Não afirma que 151 spritesheets com 8 direções foram baixadas; lacunas remotas são monitoradas para um próximo lote.
2. **Shiny**: `02-shiny.js` mantém intactas as folhas animadas de 6, 18, 62, 68, 94 e 105. Para outras espécies shiny, tenta *somente quando vistas* a paleta colorida original de `PokeAPI/sprites`. Sem hue-rotate, sem falsa cor, sem download de 151 imagens e sem bloquear a batalha; se a rede falhar, a arte anterior permanece. Mewtwo V95 não é modificado. V116 continua controlando estrelas de 1,5 s.
3. **8 líderes fiéis a Kanto**: `03-gym-kanto.js` corrige Falkner para **Brock (Geodude + Onix)** e ajusta os times dos oito líderes. Mantém fase, níveis, medalhas, capturas e formato de salvamento. Líderes ganham faixa de apresentação com suas equipes e IA reativa a ameaça, sem teleporte ou dano inventado.
4. **Combate aprimorado**: `04-combat.js` classifica o dano real aplicado pelo motor e acrescenta uma reação visual muito curta e diferente para impacto físico vs especial, além de indicadores compactos *apenas* se existir status verdadeiro. Golpes aprovados, HP, cooldowns, hitbox e sprites protegidos não são modificados.
5. **Android**: `05-mobile.js` limita DPR a ~1,35 (1 no safe), amostra FPS a cada 5 segundos, reduz DPR gradativamente sob 40 FPS, limita somente partículas genéricas em baixa performance e elimina imagens de Pokémon não ativos quando há mais de 14 no cache. Não altera as partículas dos golpes já aprovados e não cria um segundo loop. 60 FPS constantes **não são garantidos** sem teste em aparelho físico.

## Como testar
- Jogo oficial V116: `https://lulualcides-sys.github.io/Pok-mon-torre/`
- Prévia completa V117: `https://lulualcides-sys.github.io/Pok-mon-torre/?kanto117=1`
- Modo seguro V117: `https://lulualcides-sys.github.io/Pok-mon-torre/?kanto117=1&safe=1`

Os cinco scripts são executados **somente** no preview até o jogador aprovar. A biblioteca anterior permanece preservada. Os testes unitários validam todos os recursos e a integração Chrome/Android-sized verifica carregamento, Pokémon, oito ginásios, e dano real; não inventar cobertura comprovada de todas as imagens remotas.
