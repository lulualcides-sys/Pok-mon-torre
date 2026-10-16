# V132 — Osso menor e Grande Fissura aprovados

Aprovado pelo jogador em 16/10/2026: **“Diminuí um pouco mais o osso e pode salvar os 2.”**

**Jogável na URL normal:** https://lulualcides-sys.github.io/Pok-mon-torre/

- **Osso**: 40% da escala original V130, cerca de 15% menor que os 47% da V131. Arco, partículas e impacto proporcionais, contorno preto. Novo arquivo `v132-ground-approved/bone-club/index.js`.
- **Grande Fissura**: utiliza **exatamente** o render geológico V131, sem mudar nenhum quadro, mantendo abismo escuro, fissuras, pedras e poeira, arquivo `v131-ground-refinement/grande-fissura/index.js`.
- O runtime V132 intercepta APENAS `Osso`, `Grande Fissura` e alias `Fissure`; os outros golpes, inclusive **Tapa de Lama**, **Mud Shot** e **Poder Terrestre**, permanecem nos renderers originais na URL normal.
- Não há PNG, CSS animado, Ateliê, dano extra, energia nova ou edição de salvamentos. Native V359 mantém dano único no instante de impacto.

As versões anteriores de comparação continuam intactas:
- https://lulualcides-sys.github.io/Pok-mon-torre/?ground130=preview
- https://lulualcides-sys.github.io/Pok-mon-torre/?ground131=preview

Desativar somente o overlay V132 para diagnóstico: `?ground132=0`. Modo seguro `?safe=1` também desativa. Não reverter os efeitos sem nova autorização.

Os dois golpes estão aprovados e protegidos em `effects/moves/STATUS_APROVADOS.json`, `effects/v127/edited-moves.json` e fichas individuais; badges ✓ sincronizados. Total 38 movimentos protegidos, 70 fichas (32 com histórico de edição).
