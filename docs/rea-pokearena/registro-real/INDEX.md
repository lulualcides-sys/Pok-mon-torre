# Poké Arena 2D — Registro de golpes em batalha real

[Conferir elenco disponível e limites de captura](ELENCO-OBSERVADO.md)

Ação: [abrir execução no GitHub](https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39419765383)

Esta coleta registra quadros capturados em sessões reais do jogo público,
sem simular sprites, copiar atlas originais, remover bloqueios nem alterar Pokémon Torre.

## Cobertura comprovada
- Efeitos animados registrados no código fonte público: 90
- Controles de golpes planejados: 20 (quatro Pokémon × cinco controles)
- Tentativas com sequência de imagens salva: 20
- Quadros reais do navegador: 500
- Sequências com diferenças visuais: 20
- Golpes cuja ativação específica foi confirmada apenas por pixels: **0** (impossível inferir assim).
- Capturas completas ficam nos artefatos rea-real-moves-* por 90 dias; este índice permanece no GitHub.

## Personagens e erros
| Pokémon | Sequências salvas | Erros |
|---|---:|---:|
| bulbasaur | 5 | 0 |
| charmander | 5 | 0 |
| squirtle | 5 | 0 |
| pichu | 5 | 0 |

## Sequências gravadas (capturas reais)
| Pokémon | Nome exibido | Comando | Quadros | Diferença de imagem | Estado |
|---|---|---|---:|---:|---|
| bulbasaur | Razor Leaf | left | 25 | 25 | frames_saved_visual_change |
| bulbasaur | Growth | right | 25 | 25 | frames_saved_visual_change |
| bulbasaur | Vine Whip | Space | 25 | 25 | frames_saved_visual_change |
| bulbasaur | Leech Seed | q | 25 | 25 | frames_saved_visual_change |
| bulbasaur | Solar Beam | e | 25 | 25 | frames_saved_visual_change |
| charmander | Ember | left | 25 | 25 | frames_saved_visual_change |
| charmander | Flamethrower | right | 25 | 25 | frames_saved_visual_change |
| charmander | Quick Attack | Space | 25 | 25 | frames_saved_visual_change |
| charmander | Fire Spin | q | 25 | 25 | frames_saved_visual_change |
| charmander | Fire Blast | e | 25 | 25 | frames_saved_visual_change |
| squirtle | Water Gun | left | 25 | 25 | frames_saved_visual_change |
| squirtle | Bubble Beam | right | 25 | 25 | frames_saved_visual_change |
| squirtle | Rapid Spin | Space | 25 | 25 | frames_saved_visual_change |
| squirtle | Hydro Typhoon | q | 25 | 25 | frames_saved_visual_change |
| squirtle | Hydro Pump | e | 25 | 25 | frames_saved_visual_change |
| pichu | Thunder Shock | left | 25 | 25 | frames_saved_visual_change |
| pichu | Thunderbolt | right | 25 | 25 | frames_saved_visual_change |
| pichu | Quick Attack | Space | 25 | 25 | frames_saved_visual_change |
| pichu | Discharge | q | 25 | 25 | frames_saved_visual_change |
| pichu | Thunder | e | 25 | 25 | frames_saved_visual_change |

## Arquivos
- COBERTURA.json: resultados estruturados para cada tentativa e apontador para as imagens
- EFEITOS-90.json: dimensões e animações dos registros de atlas (não confundir com capturas)
- Artefatos do GitHub Actions: frame-00.png a frame-24.png de cada comando, contact-sheet.png, imagem de seleção e de batalha.

## Ainda não registrados
Efeitos de Pokémon/arenas bloqueados ou de outros modos não são marcados como capturados.
Os 90 efeitos NÃO foram todos executados; o catálogo separa o que foi visto do que falta.

## Todos os efeitos catalogados
| Efeito identificado | Frame | Animações declaradas | Correspondência com tentativa |
|---|---:|---|---|
| potenciar | 64×42 | potenciar: 14 FPS, potenciar-bucle: 10 FPS | Não testado em combate |
| shockwave | 32×32 | shockwave: 14 FPS, shockwave-fin: 16 FPS | Não testado em combate |
| telarana | 96×64 | telarana-nace: 12 FPS, telarana: 6 FPS, telarana-rompe: 12 FPS | Não testado em combate |
| huevo | 32×32 | huevo: 10 FPS, huevo-cae: 8 FPS, huevo-fin: 12 FPS | Não testado em combate |
| roca | 32×32 | roca: 10 FPS, roca-cae: 8 FPS, roca-fin: 12 FPS | Não testado em combate |
| corazon | 32×32 | corazon: 10 FPS, corazon-fin: 12 FPS | Não testado em combate |
| copos | 24×24 |  | Não testado em combate |
| aurasphere | 24×24 | vacuum: 14 FPS, vacuum-fin: 14 FPS, aurasphere: 12 FPS, aurasphere-fin: 14 FPS | Não testado em combate |
| curacion | 64×64 | curar: 12 FPS, absorber: 12 FPS | Não testado em combate |
| hilo | 32×32 | hilo: 12 FPS, hilo-fin: 12 FPS | Não testado em combate |
| pilar | 48×80 | picos: 14 FPS, pilar: 14 FPS | Não testado em combate |
| fuego2 | 24×24 | incinerate: 12 FPS, incinerate-fin: 14 FPS, searing: 12 FPS, searing-fin: 14 FPS | Não testado em combate |
| diana | 128×85 | diana: 8 FPS, crater: 12 FPS | Não testado em combate |
| extrasensory | 24×32 | extrasensory-s: 12 FPS, extrasensory-l: 12 FPS, extrasensory-fin: 14 FPS | Não testado em combate |
| barrier | 56×56 | barrier-nace: 14 FPS, barrier: 8 FPS, barrier-rompe: 14 FPS | Não testado em combate |
| psirayo | 40×40 | psirayo: 14 FPS, psirayo-fin: 16 FPS | Não testado em combate |
| psihaz_boom | 80×80 | psihazboom: 14 FPS | Não testado em combate |
| psihaz_impacto | 56×56 | psihazimpacto: 18 FPS | Não testado em combate |
| psihaz_carga | 56×56 | psihazcarga-1: 14 FPS, psihazcarga-2: 16 FPS, psihazcarga-3: 20 FPS | Não testado em combate |
| atadura | 32×32 | atadura: 10 FPS | Não testado em combate |
| psywave | 22×22 | psywave: 14 FPS, psywave-fin: 18 FPS | Não testado em combate |
| psico | 28×28 | psico-fin: 18 FPS | Não testado em combate |
| aeroblast | 48×32 | aero-a: 16 FPS, aero-b: 16 FPS, aero-c: 16 FPS, aero-boca: 14 FPS | Não testado em combate |
| aeroanillo | 28×56 | aero-anillo: 14 FPS | Não testado em combate |
| hipnosis-onda | 112×96 | hipnosis-onda: 14 FPS | Não testado em combate |
| whirlwind | 128×96 | whirlwind: 14 FPS | Não testado em combate |
| teleporte | 48×80 | teleporte-sale: 14 FPS, teleporte-llega: 14 FPS | Não testado em combate |
| geiser | 56×112 | geiser: 14 FPS | Não testado em combate |
| estela | 120×64 | estela: 10 FPS | Não testado em combate |
| buceo | 96×96 | buceo-entra: 14 FPS | Não testado em combate |
| viento | 128×102 | viento: 12 FPS, ondas: 12 FPS | Não testado em combate |
| pulsoagua | 32×32 | pulsoagua: 12 FPS, pulsoagua-fin: 14 FPS | Não testado em combate |
| tornado | 96×112 | tornado: 14 FPS, tornado-grande: 14 FPS | Não testado em combate |
| zapcannon | 48×48 | zapcannon: 12 FPS, zapcannon-nace: 12 FPS | Não testado em combate |
| barrera | 64×64 | barrera-nace: 12 FPS, barrera: 6 FPS, barrera-rompe: 14 FPS | Não testado em combate |
| vllamas | 48×48 |  | Não testado em combate |
| hipnosis | 32×32 | hipnosis: 10 FPS, hipnosis-fin: 12 FPS | Não testado em combate |
| cuchilla | 40×28 | cuchilla: 12 FPS, cuchilla-fin: 14 FPS | Não testado em combate |
| onda | 192×128 | onda: 16 FPS | Não testado em combate |
| semilla | 24×24 | semilla: 12 FPS, brote-nace: 10 FPS, brote: 6 FPS | Não testado em combate |
| ingrain | 56×40 | ingrain-nace: 10 FPS, ingrain: 6 FPS | Não testado em combate |
| raiz | 24×56 | raiz: 14 FPS | Não testado em combate |
| latigo | 96×48 | latigo: 24 FPS | Não testado em combate |
| lodo | 64×48 | lodo-cae: 14 FPS, charco: 8 FPS, charco-seca: 10 FPS, burbuja-veneno: 14 FPS | Não testado em combate |
| lodo_bola | 40×32 | lodo: 10 FPS | Não testado em combate |
| enredaderas | 96×64 | enredaderas: 10 FPS | Não testado em combate |
| hojas | 24×24 | corte: 18 FPS | Não testado em combate |
| solar | 48×32 | solar-a: 16 FPS, solar-b: 16 FPS, solar-c: 16 FPS, solar-boca: 14 FPS | Não testado em combate |
| luz | 64×64 | mota: 14 FPS, halo-1: 10 FPS, halo-2: 10 FPS, halo-3: 12 FPS | Não testado em combate |
| shurikengigante | 64×64 | shurikengigante: 16 FPS | Não testado em combate |
| shuriken | 24×24 | shuriken: 16 FPS, guijarro: 10 FPS | Não testado em combate |
| espuma | 24×24 | espuma: 10 FPS, espuma-fin: 16 FPS | Não testado em combate |
| humo | 128×96 | humo-nace: 12 FPS, humo-nube: 6 FPS | Não testado em combate |
| puf | 48×48 | puf: 16 FPS | Não testado em combate |
| meteoro | 64×64 | meteoro-cae: 14 FPS, meteoro-fin: 14 FPS | Não testado em combate |
| hexgolpe | 64×99 | hex-golpe: 14 FPS | Não testado em combate |
| hexaviso | 64×48 | hex-aviso: 10 FPS | Não testado em combate |
| lockon | 40×40 | lockon: 14 FPS, mira-nace: 16 FPS, mira: 8 FPS, lockon-fin: 18 FPS | Não testado em combate |
| astonish | 24×24 | astonish-fin: 18 FPS | Não testado em combate |
| electro | 28×28 | chispazo: 18 FPS | Não testado em combate |
| rayocae | 48×176 | rayo-cae: 14 FPS | Não testado em combate |
| discharge | 160×112 | discharge: 16 FPS | pichu:Discharge |
| hiper_vapor | 32×32 | hipervapor: 9 FPS, hiperbrasa: 10 FPS | Não testado em combate |
| hiper_boom | 80×80 | hiperboom: 14 FPS | Não testado em combate |
| hiper_impacto | 56×56 | hiperimpacto: 18 FPS | Não testado em combate |
| hiper_carga | 56×56 | hipercarga-1: 14 FPS, hipercarga-2: 16 FPS, hipercarga-3: 20 FPS | Não testado em combate |
| electroball | 40×40 | electroball: 14 FPS, electroball-fin: 16 FPS | Não testado em combate |
| thunderbolt_tramo | 96×32 |  | Não testado em combate |
| thunderbolt | 96×32 | thunderbolt-boca: 18 FPS, thunderbolt-golpe: 16 FPS | pichu:Thunderbolt |
| rayosuelo | 80×48 | rayo-aviso: 10 FPS, rayo-suelo: 14 FPS | Não testado em combate |
| arco | 64×48 | arco: 20 FPS, arco-fuerte: 16 FPS | Não testado em combate |
| acometida | 80×40 | acometida: 24 FPS | Não testado em combate |
| aterriza | 96×48 | aterriza: 16 FPS | Não testado em combate |
| inferno | 96×80 | boom: 18 FPS | Não testado em combate |
| inferno_bola | 40×40 | inferno: 12 FPS | Não testado em combate |
| aura | 80×56 | aura: 30 FPS | Não testado em combate |
| blastburn_tramo | 95×24 |  | Não testado em combate |
| blastburn | 96×40 | blastburn-boca: 14 FPS, blastburn-punta: 14 FPS | Não testado em combate |
| fly | 96×64 | fly: 14 FPS | Não testado em combate |
| fireblast_explosion | 112×112 | fireblast-boom: 16 FPS | Não testado em combate |
| fireblast | 53×53 | fireblast: 10 FPS | charmander:Fire Blast |
| firespin | 128×96 | firespin: 14 FPS | charmander:Fire Spin |
| quickattack | 64×32 | quickattack: 18 FPS | charmander:Quick Attack, pichu:Quick Attack |
| rapidspin | 64×48 | rapidspin: 20 FPS | squirtle:Rapid Spin |
| chorro | 40×32 | chorro-a: 10 FPS, chorro-b: 10 FPS, chorro-c: 10 FPS | Não testado em combate |
| impacto_agua | 32×32 | salpicadura: 16 FPS | Não testado em combate |
| gotas | 24×24 |  | Não testado em combate |
| llamitas | 24×24 |  | Não testado em combate |
| flamethrower | 112×64 | flamethrower: 14 FPS | charmander:Flamethrower |
| ember | 32×32 | ember-s: 12 FPS, ember-m: 12 FPS, ember-l: 12 FPS, ember-fin: 16 FPS | charmander:Ember |
