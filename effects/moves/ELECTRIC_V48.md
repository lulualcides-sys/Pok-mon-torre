# Pokémon Torre — elétricos cinematográficos V48

Atualização dos **quatro golpes existentes** no motor do jogo (sem imagem de divulgação):

| Golpe | Arquivo próprio | Sequência de oito fases |
| --- | --- | --- |
| Faísca | `faisca/index.js` | carga → faíscas → antecipação → avanço → aproximação → colisão → ricochete → recuperação |
| Discharge | `discharge/index.js` | carga → aura → anel → expansão → descarga radial → acerto → dissipação → fim |
| Tempestade de Raios | `tempestade-de-raios/index.js` | nuvem → marcação → primeiro raio → segundo raio → sequência → ápice → resíduos → fim |
| Trovão | `trovao/index.js` | marca → nuvem → acumulação → descida → coluna → explosão → resíduo → fim |

- Os oito quadros são **oito fases temporizadas**: o navegador desenha quadros intermediários fluidos entre elas (não oito PNGs estáticos).
- O motor visual preserva os sprites SVG originais e acrescenta raios geométricos ramificados com contorno preto, amarelo e núcleo branco, anéis de energia, traços secundários e impactos.
- `electric-sprite-kit.js` fornece apenas a camada de desenho. Dano, alcance, colisão, posição real do jogador, recarga, energia, salvamento e todos os demais golpes continuam a cargo do jogo original.
- Faísca permanece física e avança visualmente até o adversário; os outros três golpes mantêm suas assinaturas distintas.
- Todas as novas alterações ficam nos cinco arquivos elétricos. O carregador continua montando os módulos nas mesmas posições.
- Testes: `node tests/test-electric-v46.cjs` e `node tests/test-electric-v48.cjs`.
