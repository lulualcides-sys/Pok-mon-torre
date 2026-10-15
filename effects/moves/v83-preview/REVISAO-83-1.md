# V83.1 — ajustes da prévia de quatro golpes de Planta

A revisão continua **restrita ao endereço `?battle_preview=v83`**. Nada é alterado no jogo oficial, nos efeitos aprovados, em custos, dano ou tempos de recarga.

| Golpe | Multiplicador da duração da animação | Mudança |
| --- | --- | --- |
| Chicote de Vinha | 4,25× (antes 3,20×) | Movimento mais lento e legível |
| Folha Navalha | 2,95× (antes 3,20×) | Transição suave com dois sprites PixiJS por vez, deslocamento sutil em movimento contínuo; atlas pré-decodificado para reduzir travadas |
| Chicotes em Área | 2,25× (antes 3,20×) | Mais rápido e 33% menos alto, mantendo toda a distância horizontal para acertar |
| Vine Whip | 4,15× (antes 3,20×) | Movimento mais lento, sem efeito estático |

- O dano nativo acompanha os instantes de contato específicos de cada golpe, **sem entrar antes do impacto**.
- Na Folha Navalha, a interpolação **nunca revela o quadro de impacto antes do dano real**.
- Apenas os quatro golpes de Planta da prévia são afetados.
- O código reutiliza as texturas decodificadas no início, sem reconstruí-las em cada ataque.
