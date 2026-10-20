# Poké Arena 2D — Inventário integral das evoluções e mudanças de golpes

## Cobertura encontrada no código público

- **26 linhas de Pokémon**, cada uma com **3 estágios**: total **78 perfis de estágio**.
- **6 formas especiais adicionais** associadas ao estágio final: Mega Charizard X, Mega Steelix, Mega Lopunny, Mega Lucario, Shadow Lugia, Mega Mewtwo Y.
- **43 mudanças explícitas de nome de golpe** entre estágios (contando slots trocados).
- Aproximadamente **149 nomes distintos de golpes** no catálogo estático; isso não inclui variantes visuais do mesmo nome.
- Planejamento de captura: **420 combinações estágio × comando** (78×5 e 6×5), antes de deduplicar golpes iguais.
- Mudanças de dano, alcance, visual, sprite ou quantidade de projéteis também são registradas, mesmo quando o nome não muda.

### Exemplos verificados

| Evolução | Alterações importantes no moveset |
|---|---|
| Charmander → Charizard | **Blast Burn**, **Fly** |
| Bulbasaur → Venusaur | **Frenzy Plant**, **Ingrain**, **Sludge Bomb** |
| Squirtle → Blastoise | **Hydro Cannon** |
| Zubat → Crobat | **Cross Poison** |
| Magikarp → Gyarados | **Hyper Beam**, **Waterfall**, **Aqua Tail**, **Dragon Tail**, **Dragon Dance** |
| Dreepy → Dragapult | **Draco Meteor**, **Dragon Darts**, **Phantom Force**, **Dragon Dance** |
| Froakie → Greninja | **Waterburst Shuriken**, **Water Shuriken**, **Shadow Sneak** |

## Metodologia

Os dados são extraídos de `ROSTER`, `evoluciones`, dos kits por estágio e do método nativo `Luchador.kitActual()`; um estágio herda o kit anterior e substitui apenas os comandos modificados. As formas Mega podem substituir outros comandos.

O catálogo é confirmado pelo inventário do código; **isso não é prova de que as 420 animações já tenham sido registradas visualmente**. A gravação deve comprovar a etapa ativa do lutador e salvar cenas reais em Training. A evolução será ativada exclusivamente em uma sessão de navegador descartável, usando a função de evolução publicada no cliente, sem alterar servidor ou partidas online.

[Auditoria de todas as formas no GitHub Actions](https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39425713925)

[Gravador de todos os estágios e formas especiais](https://github.com/lulualcides-sys/Pok-mon-torre/blob/rea-pokearena-all-visible-moves/.github/scripts/rea-record-evolution-stages.cjs)
