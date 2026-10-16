# V119 — APROVADA E PROMOVIDA AO JOGO OFICIAL (16/10/2026)

O usuário aprovou expressamente em 16/10/2026: “Pode aprovar então e vamos mexer na 120”. Os oito módulos V119 antes exclusivos de `?kanto119=1` passam a rodar na URL oficial (sem parâmetro). Nenhum golpe aprovado, sprite, hitbox, dano, energia, cooldown, arena V98, sistemas V120–V122 ou salvamento anterior foi reescrito neste commit.

`?kanto119=0` é desligamento de diagnóstico. `?kanto119=1` continua como link legado. Nenhuma prévia V122 de Veneno é promovida.

# Histórico: V119 — Kanto Total (originalmente somente prévia)

Pedido do usuário de 16/10/2026: aplicar as melhorias **2, 3, 4, 5, 6, 7 e 8** de uma vez, mais **1% de chance de um Pokémon adversário nascer shiny**. Não foi pedida a melhoria 1 (sprites individuais de todas as espécies), então nenhum sprite de espécie previamente aprovado foi refeito.

**Um commit, oito módulos isolados, uma prévia de batalha:**
`https://lulualcides-sys.github.io/Pok-mon-torre/?kanto119=1`.
`?kanto119=1&safe=1` habilita o modo seguro. O site normal foi promovido à V119 depois da aprovação expressa.

## Implementação

1. `01-enemy-shiny.js`: exatos **1/100** (1%) por adversário, tanto selvagens como Pokémon de treinadores, ginásios e Liga. Um lançamento aleatório por monstro. Substitui, *não acumula*, o antigo sorteio aleatório de 1–3% da grama; o roll é preservado entre transições. Não muda shinies do jogador, nem a taxa de captura.
2. `02-cinematic-combat.js`: reação de câmera e clarão leves ligados **somente ao HP perdido de verdade**, depois da rotina original de dano. Sem congelar o motor e sem substituir VFX de golpes protegidos. De propósito não promete hit-stop parando a física.
3. `03-leader-ai.js`: perfis diferenciados de Brock, Misty, Lt. Surge, Erika, Koga, Sabrina, Blaine e Giovanni, com cadência/esquiva ajustadas dentro do motor e fase final com HP baixo; considera os confrontos da Liga sem teleporte, sem dano inventado e sem alterar equipes V117.
4. `04-weather-depth.js`: reflexos discretos de água no piso com chuva ou tempestade e tonalidade de solo para os demais climas. **A animação Rain Dance de 10 quadros da V118 continua exatamente igual**, sem nova cortina de chuva.
5. `05-capture-evolution.js`: três oscilações visuais com a própria Pokébola existente, minipartículas e exibição das **duas imagens reais das espécies** em evoluções que ocorrerem durante o ganho de EXP. Probabilidades, Pokébolas, XP, níveis, evoluções e salvamento não foram modificados.
6. `06-pokedex.js`: Pokédex já existente de 151 espécies recebe busca por nome/número, filtros para vistos, capturados, shinies ou desconhecidos e contadores de coleção.
7. `07-league.js`: aproveita a campanha e revanche existentes da Liga (Lorelei, Bruno, Agatha, Lance e Blue), com apresentação contextual e histórico de vitórias e títulos salvo em campo novo. **Não recria nem duplica os desafios que já funcionavam.**
8. `08-mobile.js`: amostragem de FPS e cache, remoção cuidadosa de sprites inativos quando há mais de 16, sem segundo ciclo de animação; ajustes de DPR da V117 permanecem. Não afirmar 60 FPS sustentados sem teste em aparelho físico.

## Regras de proteção e limitações

- Mewtwo V95; sprites V115/V116; arena V98; todos os golpes aprovados em `STATUS_APROVADOS.json`; Rain Dance V118; HP; hitboxes; energia; cooldowns; progressão, medalhas e salvamentos antigos permanecem.
- As prévias e os testes Chrome testam apenas amostras e fluxos reais selecionados, não cada combinação dos 151 Pokémon nem todos os golpes.
- A apresentação dos líderes e da Liga reaproveita sprites e gameplay existentes, não são filmes ou novas ilustrações estáticas.
- A evolução usa artes reais já configuradas; se um recurso externo estiver offline, mantém fallback sem bloquear o jogo.
- Uma auditoria de 151 espécies não equivale a todas as direções reais baixadas; isso fica separado da V119.
- A aprovação visual aconteceu em 16/10/2026, com a promoção documentada acima.
