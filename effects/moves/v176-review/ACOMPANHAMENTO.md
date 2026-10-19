# Pokémon Torre — revisão visual golpe por golpe (V176)

**Base jogável:** 151 espécies de Kanto, learnsets **Ultra Sun/Ultra Moon**; 18 tipos × 16 golpes = **288 golpes**. Os nomes exibidos são em inglês. Este inventário não modifica sprites nem registra aprovação automática de efeitos novos.

**Regra de aprendizado:** o golpe pertence a um *tipo* próprio e o Pokémon só pode aprendê-lo se estiver no seu learnset, mesmo quando não corresponde aos tipos da espécie. **Kabuto (140) e Kabutops (141) são Water/Rock, mas possuem Absorb (Grass), por nível, nessa geração**. Omanyte (138) não possui Absorb. Nunca retirar cobertura válida apenas por diferença de tipos.

**Mewtwo de testes:** Mewtwo próprio de teste tem os 288 golpes desbloqueados no seletor, independentemente do nível, mas equipa **4 ao mesmo tempo**. Outros Pokémon continuam com seus learnsets originais. Para escolher um golpe, usar o editor/sumário, não o botão de ataque diretamente.

**Proteção absoluta das quatro referências favoritas:** **Surf**, **Rain Dance**, **Bubble** (Bolhas), **Water Gun** (Pistola d’Água): não substituir seus efeitos ou renderizadores. As demais aprovações registradas em `effects/moves/STATUS_APROVADOS.json` e seus backups **também permanecem protegidas**. O campo «revisar» abaixo significa *não auditado nesta rodada*, **não** «efeito ausente» nem «autorizado a sobrescrever».

**Roteiro de aprovação por golpe:** 1. conferir animação original e alvo; 2. abrir prévia na batalha com o Mewtwo de testes; 3. verificar tipo/categoria, origem, trajetória e impacto; 4. conferir dano/cura/status sem duplo hit, custo, cooldown e desempenho; 5. só depois de aprovação expressa, marcar «salvo» mantendo backup e rollback. Prioridade: **Absorb** (dreno do inimigo ao usuário), **Ember** (brasas curtas), **Aqua Jet** (contato), **Scratch** (contato sem projétil). Renderizar novas animações em pixel art com PixiJS/WebGL e de 8 a 16 quadros, sem Canvas2D e sem substituir as aprovadas.

## WATER — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Bubble | Special | inimigo | ✓ Protegido / conferir efeito |
| Water Gun | Special | inimigo | ✓ Protegido / conferir efeito |
| Bubble Beam | Special | inimigo | Pendente de conferência visual |
| Aqua Jet | Physical | inimigo | Pendente de conferência visual |
| Water Pulse | Special | inimigo | ✓ Protegido / conferir efeito |
| Aqua Tail | Physical | inimigo | ✓ Protegido / conferir efeito |
| Waterfall | Physical | inimigo | Pendente de conferência visual |
| Surf | Special | inimigo | ✓ Protegido / conferir efeito |
| Brine | Special | inimigo | Pendente de conferência visual |
| Scald | Special | inimigo | Pendente de conferência visual |
| Hydro Pump | Special | inimigo | Pendente de conferência visual |
| Dive | Physical | inimigo | ✓ Protegido / conferir efeito |
| Crabhammer | Physical | inimigo | Pendente de conferência visual |
| Rain Dance | Status | campo/clima | ✓ Protegido / conferir efeito |
| Withdraw | Status | próprio usuário | ✓ Protegido / conferir efeito |
| Aqua Ring | Status | inimigo | Pendente de conferência visual |

## FIRE — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Ember | Special | inimigo | Pendente de conferência visual |
| Flame Charge | Physical | inimigo | Pendente de conferência visual |
| Flame Wheel | Physical | inimigo | Pendente de conferência visual |
| Fire Fang | Physical | inimigo | Pendente de conferência visual |
| Flamethrower | Special | inimigo | ✓ Protegido / conferir efeito |
| Fire Punch | Physical | inimigo | Pendente de conferência visual |
| Flame Burst | Special | inimigo | Pendente de conferência visual |
| Fire Spin | Special | inimigo | Pendente de conferência visual |
| Fire Blast | Special | inimigo | Pendente de conferência visual |
| Heat Wave | Special | inimigo | Pendente de conferência visual |
| Overheat | Special | inimigo | Pendente de conferência visual |
| Inferno | Special | inimigo | Pendente de conferência visual |
| Flare Blitz | Physical | inimigo | Pendente de conferência visual |
| Eruption | Special | inimigo | Pendente de conferência visual |
| Sunny Day | Status | campo/clima | Pendente de conferência visual |
| Will-O-Wisp | Status | inimigo | Pendente de conferência visual |

## GRASS — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Absorb | Special | inimigo → usuário (dreno) | Pendente de conferência visual |
| Vine Whip | Physical | inimigo | ✓ Protegido / conferir efeito |
| Razor Leaf | Physical | inimigo | ✓ Protegido / conferir efeito |
| Mega Drain | Special | inimigo → usuário (dreno) | Pendente de conferência visual |
| Giga Drain | Special | inimigo → usuário (dreno) | Pendente de conferência visual |
| Seed Bomb | Physical | inimigo | Pendente de conferência visual |
| Energy Ball | Special | inimigo | Pendente de conferência visual |
| Petal Blizzard | Physical | inimigo | Pendente de conferência visual |
| Petal Dance | Special | inimigo | Pendente de conferência visual |
| Solar Beam | Special | inimigo | Pendente de conferência visual |
| Leaf Storm | Special | inimigo | Pendente de conferência visual |
| Power Whip | Physical | inimigo | Pendente de conferência visual |
| Leech Seed | Status | inimigo | Pendente de conferência visual |
| Sleep Powder | Status | inimigo | Pendente de conferência visual |
| Stun Spore | Status | inimigo | Pendente de conferência visual |
| Spore | Status | inimigo | Pendente de conferência visual |

## ELECTRIC — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Thunder Shock | Special | inimigo | Pendente de conferência visual |
| Spark | Physical | inimigo | Pendente de conferência visual |
| Electro Ball | Special | inimigo | Pendente de conferência visual |
| Charge Beam | Special | inimigo | Pendente de conferência visual |
| Thunderbolt | Special | inimigo | Pendente de conferência visual |
| Discharge | Special | inimigo | Pendente de conferência visual |
| Thunder Punch | Physical | inimigo | Pendente de conferência visual |
| Wild Charge | Physical | inimigo | Pendente de conferência visual |
| Volt Switch | Special | inimigo | Pendente de conferência visual |
| Zap Cannon | Special | inimigo | Pendente de conferência visual |
| Thunder | Special | inimigo | Pendente de conferência visual |
| Thunder Fang | Physical | inimigo | Pendente de conferência visual |
| Thunder Wave | Status | inimigo | Pendente de conferência visual |
| Charge | Status | inimigo | Pendente de conferência visual |
| Electric Terrain | Status | campo/clima | Pendente de conferência visual |
| Magnet Rise | Status | inimigo | Pendente de conferência visual |

## ROCK — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Rock Throw | Physical | inimigo | Pendente de conferência visual |
| Rollout | Physical | inimigo | Pendente de conferência visual |
| Rock Tomb | Physical | inimigo | Pendente de conferência visual |
| Smack Down | Physical | inimigo | Pendente de conferência visual |
| Rock Blast | Physical | inimigo | Pendente de conferência visual |
| Ancient Power | Special | inimigo | Pendente de conferência visual |
| Power Gem | Special | inimigo | Pendente de conferência visual |
| Rock Slide | Physical | inimigo | Pendente de conferência visual |
| Stone Edge | Physical | inimigo | Pendente de conferência visual |
| Head Smash | Physical | inimigo | Pendente de conferência visual |
| Rock Wrecker | Physical | inimigo | Pendente de conferência visual |
| Stealth Rock | Status | inimigo | Pendente de conferência visual |
| Sandstorm | Status | campo/clima | Pendente de conferência visual |
| Rock Polish | Status | inimigo | Pendente de conferência visual |
| Wide Guard | Status | inimigo | Pendente de conferência visual |
| Diamond Storm | Physical | inimigo | Pendente de conferência visual |

## GROUND — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Mud-Slap | Special | inimigo | Pendente de conferência visual |
| Mud Shot | Special | inimigo | Pendente de conferência visual |
| Mud Bomb | Special | inimigo | Pendente de conferência visual |
| Bulldoze | Physical | inimigo | Pendente de conferência visual |
| Dig | Physical | inimigo | Pendente de conferência visual |
| Sand Tomb | Physical | inimigo | Pendente de conferência visual |
| Bone Club | Physical | inimigo | Pendente de conferência visual |
| Bonemerang | Physical | inimigo | Pendente de conferência visual |
| Drill Run | Physical | inimigo | Pendente de conferência visual |
| Earth Power | Special | inimigo | Pendente de conferência visual |
| Earthquake | Physical | inimigo | Pendente de conferência visual |
| Fissure | Physical | inimigo | ✓ Protegido / conferir efeito |
| Stomping Tantrum | Physical | inimigo | Pendente de conferência visual |
| Sand Attack | Status | inimigo | Pendente de conferência visual |
| Magnitude | Physical | inimigo | Pendente de conferência visual |
| Spikes | Status | inimigo | Pendente de conferência visual |

## ICE — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Powder Snow | Special | inimigo | Pendente de conferência visual |
| Ice Shard | Physical | inimigo | Pendente de conferência visual |
| Icy Wind | Special | inimigo | Pendente de conferência visual |
| Aurora Beam | Special | inimigo | ✓ Protegido / conferir efeito |
| Ice Beam | Special | inimigo | ✓ Protegido / conferir efeito |
| Frost Breath | Special | inimigo | Pendente de conferência visual |
| Ice Punch | Physical | inimigo | Pendente de conferência visual |
| Ice Fang | Physical | inimigo | Pendente de conferência visual |
| Avalanche | Physical | inimigo | Pendente de conferência visual |
| Icicle Spear | Physical | inimigo | Pendente de conferência visual |
| Icicle Crash | Physical | inimigo | Pendente de conferência visual |
| Blizzard | Special | inimigo | Pendente de conferência visual |
| Sheer Cold | Special | inimigo | Pendente de conferência visual |
| Haze | Status | inimigo | Pendente de conferência visual |
| Mist | Status | inimigo | Pendente de conferência visual |
| Hail | Status | campo/clima | Pendente de conferência visual |

## POISON — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Poison Sting | Physical | inimigo | Pendente de conferência visual |
| Acid | Special | inimigo | Pendente de conferência visual |
| Acid Spray | Special | inimigo | Pendente de conferência visual |
| Smog | Special | inimigo | Pendente de conferência visual |
| Sludge | Special | inimigo | Pendente de conferência visual |
| Venoshock | Special | inimigo | ✓ Protegido / conferir efeito |
| Poison Fang | Physical | inimigo | Pendente de conferência visual |
| Poison Jab | Physical | inimigo | ✓ Protegido / conferir efeito |
| Sludge Bomb | Special | inimigo | Pendente de conferência visual |
| Sludge Wave | Special | inimigo | Pendente de conferência visual |
| Gunk Shot | Physical | inimigo | Pendente de conferência visual |
| Toxic | Status | inimigo | Pendente de conferência visual |
| Poison Powder | Status | inimigo | Pendente de conferência visual |
| Poison Gas | Status | inimigo | Pendente de conferência visual |
| Toxic Spikes | Status | inimigo | Pendente de conferência visual |
| Acid Armor | Status | próprio usuário | Pendente de conferência visual |

## BUG — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| String Shot | Status | inimigo | Pendente de conferência visual |
| Bug Bite | Physical | inimigo | Pendente de conferência visual |
| Twineedle | Physical | inimigo | Pendente de conferência visual |
| Fury Cutter | Physical | inimigo | Pendente de conferência visual |
| Pin Missile | Physical | inimigo | Pendente de conferência visual |
| Leech Life | Physical | inimigo → usuário (dreno) | Pendente de conferência visual |
| Silver Wind | Special | inimigo | Pendente de conferência visual |
| Signal Beam | Special | inimigo | Pendente de conferência visual |
| X-Scissor | Physical | inimigo | Pendente de conferência visual |
| U-turn | Physical | inimigo | Pendente de conferência visual |
| Bug Buzz | Special | inimigo | Pendente de conferência visual |
| Megahorn | Physical | inimigo | Pendente de conferência visual |
| Quiver Dance | Status | inimigo | Pendente de conferência visual |
| Rage Powder | Status | inimigo | Pendente de conferência visual |
| Infestation | Special | inimigo | Pendente de conferência visual |
| Fell Stinger | Physical | inimigo | Pendente de conferência visual |

## FLYING — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Gust | Special | inimigo | ✓ Protegido / conferir efeito |
| Peck | Physical | inimigo | ✓ Protegido / conferir efeito |
| Wing Attack | Physical | inimigo | Pendente de conferência visual |
| Air Cutter | Special | inimigo | Pendente de conferência visual |
| Aerial Ace | Physical | inimigo | Pendente de conferência visual |
| Air Slash | Special | inimigo | ✓ Protegido / conferir efeito |
| Pluck | Physical | inimigo | Pendente de conferência visual |
| Fly | Physical | inimigo | Pendente de conferência visual |
| Drill Peck | Physical | inimigo | Pendente de conferência visual |
| Hurricane | Special | inimigo | Pendente de conferência visual |
| Brave Bird | Physical | inimigo | Pendente de conferência visual |
| Sky Attack | Physical | inimigo | Pendente de conferência visual |
| Roost | Status | próprio usuário | ✓ Protegido / conferir efeito |
| Tailwind | Status | inimigo | Pendente de conferência visual |
| Feather Dance | Status | inimigo | Pendente de conferência visual |
| Mirror Move | Status | inimigo | Pendente de conferência visual |

## FIGHTING — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Karate Chop | Physical | inimigo | ✓ Protegido / conferir efeito |
| Double Kick | Physical | inimigo | Pendente de conferência visual |
| Low Kick | Physical | inimigo | Pendente de conferência visual |
| Mach Punch | Physical | inimigo | Pendente de conferência visual |
| Brick Break | Physical | inimigo | ✓ Protegido / conferir efeito |
| Cross Chop | Physical | inimigo | ✓ Protegido / conferir efeito |
| Close Combat | Physical | inimigo | Pendente de conferência visual |
| Dynamic Punch | Physical | inimigo | Pendente de conferência visual |
| Focus Blast | Special | inimigo | Pendente de conferência visual |
| Focus Punch | Physical | inimigo | Pendente de conferência visual |
| Superpower | Physical | inimigo | Pendente de conferência visual |
| Jump Kick | Physical | inimigo | Pendente de conferência visual |
| Revenge | Physical | inimigo | Pendente de conferência visual |
| Submission | Physical | inimigo | Pendente de conferência visual |
| Bulk Up | Status | próprio usuário | Pendente de conferência visual |
| Counter | Physical | inimigo | Pendente de conferência visual |

## PSYCHIC — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Confusion | Special | inimigo | ✓ Protegido / conferir efeito |
| Psybeam | Special | inimigo | ✓ Protegido / conferir efeito |
| Psychic | Special | inimigo | Pendente de conferência visual |
| Psyshock | Special | inimigo | Pendente de conferência visual |
| Zen Headbutt | Physical | inimigo | Pendente de conferência visual |
| Future Sight | Special | inimigo | Pendente de conferência visual |
| Dream Eater | Special | inimigo → usuário (dreno) | Pendente de conferência visual |
| Psycho Cut | Physical | inimigo | Pendente de conferência visual |
| Psystrike | Special | inimigo | Pendente de conferência visual |
| Psywave | Special | inimigo | Pendente de conferência visual |
| Teleport | Status | inimigo | Pendente de conferência visual |
| Hypnosis | Status | inimigo | Pendente de conferência visual |
| Reflect | Status | próprio usuário | Pendente de conferência visual |
| Light Screen | Status | próprio usuário | Pendente de conferência visual |
| Calm Mind | Status | próprio usuário | Pendente de conferência visual |
| Agility | Status | próprio usuário | Pendente de conferência visual |

## GHOST — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Lick | Physical | inimigo | Pendente de conferência visual |
| Astonish | Physical | inimigo | Pendente de conferência visual |
| Night Shade | Special | inimigo | Pendente de conferência visual |
| Shadow Punch | Physical | inimigo | Pendente de conferência visual |
| Shadow Claw | Physical | inimigo | Pendente de conferência visual |
| Hex | Special | inimigo | Pendente de conferência visual |
| Shadow Ball | Special | inimigo | Pendente de conferência visual |
| Shadow Sneak | Physical | inimigo | Pendente de conferência visual |
| Phantom Force | Physical | inimigo | Pendente de conferência visual |
| Ominous Wind | Special | inimigo | Pendente de conferência visual |
| Confuse Ray | Status | inimigo | Pendente de conferência visual |
| Curse | Status | inimigo | Pendente de conferência visual |
| Destiny Bond | Status | inimigo | Pendente de conferência visual |
| Spite | Status | inimigo | Pendente de conferência visual |
| Grudge | Status | inimigo | Pendente de conferência visual |
| Nightmare | Status | inimigo | Pendente de conferência visual |

## DARK — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Bite | Physical | inimigo | Pendente de conferência visual |
| Pursuit | Physical | inimigo | Pendente de conferência visual |
| Thief | Physical | inimigo | Pendente de conferência visual |
| Feint Attack | Physical | inimigo | Pendente de conferência visual |
| Payback | Physical | inimigo | Pendente de conferência visual |
| Assurance | Physical | inimigo | Pendente de conferência visual |
| Night Slash | Physical | inimigo | Pendente de conferência visual |
| Crunch | Physical | inimigo | Pendente de conferência visual |
| Sucker Punch | Physical | inimigo | Pendente de conferência visual |
| Dark Pulse | Special | inimigo | Pendente de conferência visual |
| Knock Off | Physical | inimigo | Pendente de conferência visual |
| Foul Play | Physical | inimigo | Pendente de conferência visual |
| Snarl | Special | inimigo | Pendente de conferência visual |
| Taunt | Status | inimigo | Pendente de conferência visual |
| Nasty Plot | Status | inimigo | Pendente de conferência visual |
| Torment | Status | inimigo | Pendente de conferência visual |

## NORMAL — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Tackle | Physical | inimigo | Pendente de conferência visual |
| Scratch | Physical | inimigo | Pendente de conferência visual |
| Pound | Physical | inimigo | Pendente de conferência visual |
| Growl | Status | inimigo | Pendente de conferência visual |
| Leer | Status | inimigo | Pendente de conferência visual |
| Tail Whip | Status | inimigo | Pendente de conferência visual |
| Quick Attack | Physical | inimigo | Pendente de conferência visual |
| Harden | Status | próprio usuário | Pendente de conferência visual |
| Splash | Status | próprio usuário | Pendente de conferência visual |
| Transform | Status | inimigo | Pendente de conferência visual |
| Sing | Status | inimigo | Pendente de conferência visual |
| Recover | Status | próprio usuário | Pendente de conferência visual |
| Swift | Special | inimigo | Pendente de conferência visual |
| Body Slam | Physical | inimigo | Pendente de conferência visual |
| Hyper Beam | Special | inimigo | Pendente de conferência visual |
| Tri Attack | Special | inimigo | ✓ Protegido / conferir efeito |

## DRAGON — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Twister | Special | inimigo | Pendente de conferência visual |
| Dragon Rage | Special | inimigo | Pendente de conferência visual |
| Dragon Breath | Special | inimigo | Pendente de conferência visual |
| Dragon Tail | Physical | inimigo | Pendente de conferência visual |
| Dragon Claw | Physical | inimigo | Pendente de conferência visual |
| Dragon Pulse | Special | inimigo | Pendente de conferência visual |
| Dragon Rush | Physical | inimigo | Pendente de conferência visual |
| Dual Chop | Physical | inimigo | Pendente de conferência visual |
| Outrage | Physical | inimigo | Pendente de conferência visual |
| Draco Meteor | Special | inimigo | Pendente de conferência visual |
| Dragon Dance | Status | próprio usuário | Pendente de conferência visual |
| Dragon Hammer | Physical | inimigo | Pendente de conferência visual |
| Clanging Scales | Special | inimigo | Pendente de conferência visual |
| Core Enforcer | Special | inimigo | Pendente de conferência visual |
| Roar of Time | Special | inimigo | Pendente de conferência visual |
| Spacial Rend | Special | inimigo | Pendente de conferência visual |

## STEEL — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Metal Claw | Physical | inimigo | Pendente de conferência visual |
| Bullet Punch | Physical | inimigo | Pendente de conferência visual |
| Mirror Shot | Special | inimigo | Pendente de conferência visual |
| Magnet Bomb | Physical | inimigo | Pendente de conferência visual |
| Gyro Ball | Physical | inimigo | Pendente de conferência visual |
| Flash Cannon | Special | inimigo | Pendente de conferência visual |
| Iron Head | Physical | inimigo | Pendente de conferência visual |
| Iron Tail | Physical | inimigo | Pendente de conferência visual |
| Steel Wing | Physical | inimigo | Pendente de conferência visual |
| Meteor Mash | Physical | inimigo | Pendente de conferência visual |
| Heavy Slam | Physical | inimigo | Pendente de conferência visual |
| Smart Strike | Physical | inimigo | Pendente de conferência visual |
| Iron Defense | Status | próprio usuário | Pendente de conferência visual |
| Metal Sound | Status | inimigo | Pendente de conferência visual |
| Autotomize | Status | inimigo | Pendente de conferência visual |
| Shift Gear | Status | inimigo | Pendente de conferência visual |

## FAIRY — 16 golpes

| Golpe (inglês) | Classe | Alvo correto | Revisão |
|---|---|---|---|
| Disarming Voice | Special | inimigo | Pendente de conferência visual |
| Draining Kiss | Special | inimigo | Pendente de conferência visual |
| Dazzling Gleam | Special | inimigo | Pendente de conferência visual |
| Play Rough | Physical | inimigo | Pendente de conferência visual |
| Moonblast | Special | inimigo | Pendente de conferência visual |
| Fairy Wind | Special | inimigo | Pendente de conferência visual |
| Misty Explosion | Special | inimigo | Pendente de conferência visual |
| Spirit Break | Physical | inimigo | Pendente de conferência visual |
| Moonlight | Status | próprio usuário | Pendente de conferência visual |
| Charm | Status | inimigo | Pendente de conferência visual |
| Baby-Doll Eyes | Status | inimigo | Pendente de conferência visual |
| Sweet Kiss | Status | inimigo | Pendente de conferência visual |
| Misty Terrain | Status | campo/clima | Pendente de conferência visual |
| Fairy Lock | Status | inimigo | Pendente de conferência visual |
| Aromatic Mist | Status | inimigo | Pendente de conferência visual |
| Geomancy | Status | inimigo | Pendente de conferência visual |


_Registro gerado do catálogo V175 e das proteções históricas, em 19/10/2026. Nenhum «pendente» deve ser interpretado como autorização para apagar efeitos anteriores._
