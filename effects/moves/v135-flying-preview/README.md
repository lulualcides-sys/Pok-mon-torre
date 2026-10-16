# V135 — Prévia jogável de quatro golpes Voadores

**Ainda em teste, sem aprovação visual do usuário.** Abrir dentro do jogo:
https://lulualcides-sys.github.io/Pok-mon-torre/?flying135=preview

Escolha **Roost, Rajada, Air Slash e Bicada** na equipe de Mewtwo nível 50 e entre em batalha.

| Golpe | Quadros | Visual fiel ao estilo Pokémon |
|---|---:|---|
| Roost | 12 | Asas recolhem, penas descem, ar aquieta e Pokémon recupera com a mecânica nativa. |
| Rajada (Gust) | 16 | Fluxos de ar espiralados e rajada dirigida ao adversário, com turbulência discreta. |
| Air Slash | 16 | Lâminas crescentes de vento comprimido cortam o alvo e se dissipam. |
| Bicada (Peck) | 12 | Bico compacto e pontudo avança rapidamente para contato e deixa impacto curto. |

Não são imagens ilustrativas: efeitos vetoriais animados no Canvas do próprio motor de batalha, com contorno escuro, pouca alocação em quadros e `detailStep` para partículas secundárias no Android sob carga. Nenhum PNG estático, CSS animado, segundo loop ou Ateliê. O motor V359 continua responsável pelo único dano, cura, custos, recarga, limite de golpes e gravações. A camada instala apenas com o parâmetro da prévia e não afeta os golpes aprovados; retirar o parâmetro ou usar `?safe=1` mantém o jogo original. **O histórico de Rajada marcada EDITADO e Air Slash editado fica preservado** até a avaliação e aprovação da prévia.

Testes: `node tests/v135-flying-preview.test.cjs` + regressões V134, V132 e V128. Só afirmar publicação após workflow Pages concluído.
