# Pokémon Torre — quatro golpes de Planta / versão V84.2 preservada

**Estado por decisão do usuário (15/10/2026):** "Deixa assim mesmo, continua bugado mas pode salvar."

## Congelar esta versão sem alterações

- **Folha Navalha:** o visual V84 foi elogiado, e o usuário pediu apenas aumentar a velocidade; a V84.2 usa **os mesmos sprites V83** com velocidade **2,25×** da duração de base. Preservar.
- **Chicote de Vinha:** manter exatamente o visual V84.2, apesar de o usuário relatar que **ainda está bugado**.
- **Chicotes em Área:** manter exatamente o visual V84.2, embora **ainda esteja bugado**.
- **Vine Whip:** manter exatamente o visual V84.2, apesar de o usuário relatar que **ainda está bugado e confuso visualmente com os chicotes**.

Esta é uma **decisão de preservar o estado atual**, não uma confirmação de que os bugs foram resolvidos ou de que a estética dos três chicotes foi plenamente aprovada. **Não refazer, acelerar, trocar sprites ou corrigir esses golpes sem novo pedido do usuário.**

## Referência exata da versão salva

- Código da prévia: `effects/moves/v84-preview/render.js`.
- Sincronização de HP: `effects/moves/v84-preview/impact-sync.js`.
- Gerador dos três novos atlases: `tools/build-v84-2-separated-vines.py`.
- Sprites dos três chicotes: `effects/moves/{chicote-de-vinha,chicotes-em-area,vine-whip}/v84-preview/sprites/{nome}.webp` (gerados pela rotina de deploy).
- Folha Navalha utiliza o mesmo atlas em `effects/moves/folha-navalha/v83-preview/sprites/folha-navalha.webp`.
- Link de prévia salvo: https://lulualcides-sys.github.io/Pok-mon-torre/?battle_preview=v84&build=v84-2-tres-distintos
- Base da implementação V84.2: merge `47268e0e7633b2d0402980600418abaef528b1e7`, PR #31.

**Importante:** a V84.2 permanece disponível como prévia opt-in por URL. Não alterar o renderizador normal do jogo ou outros golpes já aprovados apenas para registrar este estado. A versão com bugs conhecidos fica congelada aqui para retomada futura, se solicitada.
