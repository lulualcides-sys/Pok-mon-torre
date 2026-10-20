# Poké Arena 2D — auditoria pública de sistema visual

Perfil: bulbasaur. Arena solicitada pela automação: Stadium.

Esta é uma coleta técnica da interface pública. Não representa acesso irrestrito a conteúdo bloqueado ou privado.

## Inventário observado
- JavaScript descoberto: 59; analisado como AST: 58
- Atlases com dimensões detectadas: 90
- Referências a recursos gráficos/áudio: 9
- Nomes candidatos de movimentos (heurística, requer revisão): 54
- Pastas de efeitos no Pokémon Torre: 103

## Dados de spritesheets detectados
| Chave | Frame | Colunas | Animações e FPS |
|---|---:|---:|---|
| potenciar | 64x42 | 4 | potenciar:14, potenciar-bucle:10 |
| shockwave | 32x32 | 4 | shockwave:14, shockwave-fin:16 |
| telarana | 96x64 | 4 | telarana-nace:12, telarana:6, telarana-rompe:12 |
| huevo | 32x32 | 4 | huevo:10, huevo-cae:8, huevo-fin:12 |
| roca | 32x32 | 4 | roca:10, roca-cae:8, roca-fin:12 |
| corazon | 32x32 | 4 | corazon:10, corazon-fin:12 |
| copos | 24x24 | 8 |  |
| aurasphere | 24x24 | 4 | vacuum:14, vacuum-fin:14, aurasphere:12, aurasphere-fin:14 |
| curacion | 64x64 | 4 | curar:12, absorber:12 |
| hilo | 32x32 | 4 | hilo:12, hilo-fin:12 |
| pilar | 48x80 | 6 | picos:14, pilar:14 |
| fuego2 | 24x24 | 4 | incinerate:12, incinerate-fin:14, searing:12, searing-fin:14 |
| diana | 128x85 | 4 | diana:8, crater:12 |
| extrasensory | 24x32 | 4 | extrasensory-s:12, extrasensory-l:12, extrasensory-fin:14 |
| barrier | 56x56 | 4 | barrier-nace:14, barrier:8, barrier-rompe:14 |
| psirayo | 40x40 | 6 | psirayo:14, psirayo-fin:16 |
| psihaz_boom | 80x80 | 6 | psihazboom:14 |
| psihaz_impacto | 56x56 | 6 | psihazimpacto:18 |
| psihaz_carga | 56x56 | 6 | psihazcarga-1:14, psihazcarga-2:16, psihazcarga-3:20 |
| atadura | 32x32 | 6 | atadura:10 |
| psywave | 22x22 | 6 | psywave:14, psywave-fin:18 |
| psico | 28x28 | 8 | psico-fin:18 |
| aeroblast | 48x32 | 6 | aero-a:16, aero-b:16, aero-c:16, aero-boca:14 |
| aeroanillo | 28x56 | 6 | aero-anillo:14 |
| hipnosis-onda | 112x96 | 4 | hipnosis-onda:14 |
| whirlwind | 128x96 | 4 | whirlwind:14 |
| teleporte | 48x80 | 6 | teleporte-sale:14, teleporte-llega:14 |
| geiser | 56x112 | 8 | geiser:14 |
| estela | 120x64 | 6 | estela:10 |
| buceo | 96x96 | 6 | buceo-entra:14 |
| viento | 128x102 | 4 | viento:12, ondas:12 |
| pulsoagua | 32x32 | 4 | pulsoagua:12, pulsoagua-fin:14 |
| tornado | 96x112 | 4 | tornado:14, tornado-grande:14 |
| zapcannon | 48x48 | 4 | zapcannon:12, zapcannon-nace:12 |
| barrera | 64x64 | 4 | barrera-nace:12, barrera:6, barrera-rompe:14 |
| vllamas | 48x48 | 6 |  |
| hipnosis | 32x32 | 4 | hipnosis:10, hipnosis-fin:12 |
| cuchilla | 40x28 | 3 | cuchilla:12, cuchilla-fin:14 |
| onda | 192x128 | 3 | onda:16 |
| semilla | 24x24 | 6 | semilla:12, brote-nace:10, brote:6 |
| ingrain | 56x40 | 4 | ingrain-nace:10, ingrain:6 |
| raiz | 24x56 | 8 | raiz:14 |
| latigo | 96x48 | 3 | latigo:24 |
| lodo | 64x48 | 6 | lodo-cae:14, charco:8, charco-seca:10, burbuja-veneno:14 |
| lodo_bola | 40x32 | 6 | lodo:10 |
| enredaderas | 96x64 | 4 | enredaderas:10 |
| hojas | 24x24 | 8 | corte:18 |
| solar | 48x32 | 6 | solar-a:16, solar-b:16, solar-c:16, solar-boca:14 |
| luz | 64x64 | 6 | mota:14, halo-1:10, halo-2:10, halo-3:12 |
| shurikengigante | 64x64 | 6 | shurikengigante:16 |
| shuriken | 24x24 | 6 | shuriken:16, guijarro:10 |
| espuma | 24x24 | 6 | espuma:10, espuma-fin:16 |
| humo | 128x96 | 4 | humo-nace:12, humo-nube:6 |
| puf | 48x48 | 6 | puf:16 |
| meteoro | 64x64 | 6 | meteoro-cae:14, meteoro-fin:14 |
| hexgolpe | 64x99 | 6 | hex-golpe:14 |
| hexaviso | 64x48 | 6 | hex-aviso:10 |
| lockon | 40x40 | 6 | lockon:14, mira-nace:16, mira:8, lockon-fin:18 |
| astonish | 24x24 | 8 | astonish-fin:18 |
| electro | 28x28 | 8 | chispazo:18 |
| rayocae | 48x176 | 6 | rayo-cae:14 |
| discharge | 160x112 | 3 | discharge:16 |
| hiper_vapor | 32x32 | 6 | hipervapor:9, hiperbrasa:10 |
| hiper_boom | 80x80 | 6 | hiperboom:14 |
| hiper_impacto | 56x56 | 6 | hiperimpacto:18 |
| hiper_carga | 56x56 | 6 | hipercarga-1:14, hipercarga-2:16, hipercarga-3:20 |
| electroball | 40x40 | 6 | electroball:14, electroball-fin:16 |
| thunderbolt_tramo | 96x32 | 4 |  |
| thunderbolt | 96x32 | 4 | thunderbolt-boca:18, thunderbolt-golpe:16 |
| rayosuelo | 80x48 | 4 | rayo-aviso:10, rayo-suelo:14 |
| arco | 64x48 | 4 | arco:20, arco-fuerte:16 |
| acometida | 80x40 | 3 | acometida:24 |
| aterriza | 96x48 | 3 | aterriza:16 |
| inferno | 96x80 | 6 | boom:18 |
| inferno_bola | 40x40 | 6 | inferno:12 |
| aura | 80x56 | 3 | aura:30 |
| blastburn_tramo | 95x24 | 4 |  |
| blastburn | 96x40 | 4 | blastburn-boca:14, blastburn-punta:14 |
| fly | 96x64 | 3 | fly:14 |
| fireblast_explosion | 112x112 | 4 | fireblast-boom:16 |
| fireblast | 53x53 | 2 | fireblast:10 |
| firespin | 128x96 | 3 | firespin:14 |
| quickattack | 64x32 | 2 | quickattack:18 |
| rapidspin | 64x48 | 3 | rapidspin:20 |
| chorro | 40x32 | 6 | chorro-a:10, chorro-b:10, chorro-c:10 |
| impacto_agua | 32x32 | 6 | salpicadura:16 |
| gotas | 24x24 | 8 |  |
| llamitas | 24x24 | 8 |  |
| flamethrower | 112x64 | 2 | flamethrower:14 |
| ember | 32x32 | 4 | ember-s:12, ember-m:12, ember-l:12, ember-fin:16 |

## Fontes e cenas observadas
- src-3a160064ab/escenas/seleccion.js (22790 bytes; 1 mapas estáticos top-level)
- src-3a160064ab/escenas/titulo.js (13926 bytes; 3 mapas estáticos top-level)
- src-3a160064ab/escenas/carga.js (4614 bytes; 0 mapas estáticos top-level)
- src-3a160064ab/escenas/combate.js (35419 bytes; 1 mapas estáticos top-level)
- src-3a160064ab/escenas/reel.js (20714 bytes; 2 mapas estáticos top-level)
- src-3a160064ab/escenas/preparar.js (12941 bytes; 1 mapas estáticos top-level)
- src-3a160064ab/escenas/batalla.js (21917 bytes; 1 mapas estáticos top-level)
- src-3a160064ab/escenas/pokedex.js (8720 bytes; 1 mapas estáticos top-level)
- src-3a160064ab/escenas/sala.js (14214 bytes; 1 mapas estáticos top-level)
- src-3a160064ab/escenas/creditos.js (1209 bytes; 1 mapas estáticos top-level)
- src-3a160064ab/escenas/cuenta.js (4920 bytes; 1 mapas estáticos top-level)
- src-3a160064ab/escenas/ranked.js (9522 bytes; 0 mapas estáticos top-level)
- src-3a160064ab/escenas/novedades.js (1927 bytes; 1 mapas estáticos top-level)
- src-3a160064ab/escenas/salas.js (9137 bytes; 0 mapas estáticos top-level)
- src-3a160064ab/escenas/amigos.js (6139 bytes; 1 mapas estáticos top-level)
- src-3a160064ab/escenas/sala_arena.js (11673 bytes; 1 mapas estáticos top-level)
- src-3a160064ab/escenas/perfil.js (18594 bytes; 0 mapas estáticos top-level)
- src-3a160064ab/escenas/clasificacion.js (5963 bytes; 0 mapas estáticos top-level)
- src-3a160064ab/escenas/liga.js (5698 bytes; 0 mapas estáticos top-level)
- src-3a160064ab/campos.js (2054 bytes; 0 mapas estáticos top-level)
- src-3a160064ab/arena.js (31908 bytes; 4 mapas estáticos top-level)
- src-3a160064ab/vfx.js (30897 bytes; 7 mapas estáticos top-level)
- src-3a160064ab/sprites.js (4621 bytes; 0 mapas estáticos top-level)
- src-3a160064ab/habilidades.js (199484 bytes; 19 mapas estáticos top-level)

## Testes de cinco comandos por Pokémon
- left: 12 de 12 quadros com mudança visível. Não comprova qual habilidade ativou.
- right: 11 de 12 quadros com mudança visível. Não comprova qual habilidade ativou.
- Space: 12 de 12 quadros com mudança visível. Não comprova qual habilidade ativou.
- q: 9 de 12 quadros com mudança visível. Não comprova qual habilidade ativou.
- e: 11 de 12 quadros com mudança visível. Não comprova qual habilidade ativou.

## Restrições
- Aprovação visual e gameplay precisam ser checadas, mesmo quando a análise AST encontra um registro.
- Conteúdo de modos online, contas ou desbloqueios não é coberto.
- O REA fornece evidências passivas; este script auxilia a navegação para observar o jogo.
- Não foram incorporados arquivos ou código de terceiros ao Pokémon Torre.
- Implementar equivalentes autorais no PixiJS/WebGL, comparar impacto e manter golpes aprovados intactos.

Arquivos: INVENTARIO-GERAL.json (perfil bulbasaur), survey.json, frames/, rea-inspect.json, rea-bundle.json.