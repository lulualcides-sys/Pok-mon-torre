# V128 — prévia isolada dos quatro golpes de Água (16/10/2026)

Link: https://lulualcides-sys.github.io/Pok-mon-torre/?battle_preview=water128

Quatro equipados na imagem do usuário: **Withdraw, Pistola d'Água, Bolhas, Mergulho**. Módulos separados `withdraw/`, `water-gun/`, `bubbles/` e `dive/`, além de `runtime.js`.

Apenas a rota `?battle_preview=water128` ativa estas novas animações; o jogo normal preserva as versões anteriores. Efeitos desenhados frame a frame no Canvas de batalha existente com contornos escuros, cores e transparência: **nenhuma PNG estática nem animação CSS**. O motor atual continua utilizando PixiJS para outros efeitos. A animação de água utiliza 12/16 fases dinâmicas; os quatro são visualmente distintos e o Mergulho mostra submersão/retorno, mas não modifica a lógica antiga para dois turnos. Dano nativo único V359, energia, cooldown, salvamentos e demais animações oficiais preservados. Para ataques V359 a prévia alarga apenas o tempo visual e reposiciona junto o evento nativo de impacto para sincronismo.

**Ainda não aprovado:** aguardar avaliação visual antes de promover os quatro à URL normal. Cauda de Água e Pulso de Água já aprovados devem permanecer intocados. Nenhum Ateliê e nenhuma foto.

Desativar a prévia removendo o parâmetro. Uma falha no módulo deixa as animações anteriores intactas.