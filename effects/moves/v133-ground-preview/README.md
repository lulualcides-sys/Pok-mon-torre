# V133 — quatro golpes Terra para prévia jogável

Teste **no Pokémon Torre**, na arena real:

https://lulualcides-sys.github.io/Pok-mon-torre/?ground133=preview

Equipe Mewtwo nível 50 com estes quatro golpes (a captura atual) e entre na batalha: **Garra de Areia, Soco de Terra, Lança de Areia, Fenda Rasa**.

A proposta usa movimentação de areia, impacto físico e fendas de Pokémon, mas os quatro nomes são específicos do catálogo Pokémon Torre, não nomes canônicos de golpes originais com animações únicas oficiais. Aqui cada golpe tem visual próprio, sem PNG, fotomontagem, CSS animado, efeito genérico idêntico nem interface de Ateliê.

| Golpe | Quadros | Animação dentro da batalha |
|---|---:|---|
| Garra de Areia | 16 | Três cortes oblíquos minerais sucessivos, grãos, lascas e poeira seca. |
| Soco de Terra | 16 | Punho de rocha compacto avançando, golpe de contato e fratura pequena. |
| Lança de Areia | 16 | Projétil em lança pontiaguda, textura e trilha granular até o impacto. |
| Fenda Rasa | 12 | Rachadura estreita pelo solo até o alvo, ramificações e pedrinhas; **não igual** à Grande Fissura. |

As animações procedurais são desenhadas por quadros no Canvas já existente (contorno escuro, proporção apropriada, 12/16 poses), registradas em pastas separadas com tempo visual sincronizado ao evento nativo V359. **Apenas visual**, nenhum ataque extra, mecânica alterada, salvamento ou desbloqueio concedido.

**Protegidos e intocados:** Osso e Grande Fissura V132, Tapa de Lama, Mud Shot, Poder Terrestre V130, os seis golpes de Água V128, todos os outros aprovados. A versão normal segue funcionando como estava. `?safe=1` desliga a prévia. Retirar `ground133=preview` volta ao oficial.

**Aguardando aprovação visual do jogador antes de promover os quatro ao jogo normal.** Verificar `tests/v133-ground-preview.test.cjs` e o workflow do GitHub Pages antes de dar link como pronto.
