# Pokémon Torre — plano de reconstrução visual a partir da auditoria REA

**Escopo da referência:** Poké Arena 2D, versão pública observada em 20/10/2026.  
**Relatório bruto:** docs/rea-pokearena/INVENTARIO-GERAL.json  
**Amostras de batalha:** amostra-bulbasaur, amostra-charmander, amostra-squirtle e amostra-pikachu (Pichu observado).  
**Motor do Torre:** PixiJS/WebGL existente; não migrar automaticamente para Phaser.

## O que foi verificado

- 59 recursos JavaScript inventariados; 58 analisados como AST e Phaser identificado como dependência pública.
- 90 entradas de spritesheets animadas, com nome de efeito, tamanho de quadro, colunas e FPS de animação quando declarados.
- O registro FORMAS em habilidades.js tem **53 chaves** de comportamento; isso não significa 53 golpes nem 53 efeitos visualmente verificados.
- Quatro arenas selecionáveis testadas em combate: Stadium, Neon, Crater e Ruins.
- Quatro personagens testados (Bulbasaur, Charmander, Squirtle e Pichu), cinco comandos por personagem, 20 sequências de tentativa de golpe; mudança de pixels não prova ativação de cada habilidade.
- 389 caminhos de recursos de rede observados; 103 diretórios em effects/moves no Torre (incluem versões e infraestrutura, não necessariamente golpes diferentes).
- effects/moves/STATUS_APROVADOS.json mantém **48 efeitos protegidos**, dos quais 37 aprovados, 9 salvos e 2 provisórios, conforme o arquivo lido na auditoria.

## Como traduzir as 53 formas em componentes próprios

A classificação abaixo é **proposta de implementação para o Torre**, e não equivalência confirmada de classes internas do Poké Arena.

| Núcleo reutilizável PixiJS | Formas encontradas | Arquitetura de efeitos |
|---|---|---|
| Projetil | proyectil, lanzamiento, meteoro, burbuja, burbujas, andanada, bombaLodo | AnimatedSprite + trajetória, orientação e impacto |
| Jato / raio / onda | chorro, cono, rayo, pulso, rayoCielo, rafaga, hidrocanon, viento, ola, chapoteo | nascimento na boca, emissão contínua e colisão |
| Contato físico | tajo, dash, golpe, patada, embestidas, furia, salto, vuelo, helice, contra | aproximação, contato, flash de impacto, recuo |
| Área | zona, tormenta, erupcion, torbellino, explosion, vcreate, estallido, lluvia, tormentaHojas, plantaFeroz | telegráfo, expansão, dispersão, término |
| Persistentes | trampa, telarana, redElectrica, arraigo, atrapa | efeitos com duração, âncora no mapa e remoção |
| Status / suporte | escudo, disfraz, potenciar, recuperar, descanso, crecimiento, clones, humo, maleficio, mira | aura, HUD e alterações visuais sem dano indevido |
| Defensivo especial | caparazon | composição de sprites sobre o lutador |

Todas as formas originais detectadas aparecem em uma dessas classes propostas; isso evita um efeito genérico único para golpes de natureza diferente.

## Visual: o que devemos reproduzir como sistema (sem copiar arte)

1. **Animação desenhada quadro a quadro:** ataques simples com 8 quadros; médios com 12; complexos com 16, no LibreSprite. O número só muda com prova visual e orçamento de GPU.
2. **Origens e escala:** para jatos de fogo/água, nascem do Pokémon, direcionam-se ao alvo e param no contato; nada de bolinhas genéricas saindo do centro da arena.
3. **Camadas:** background, sombra leve de contato, lutadores, projéteis, impacto, partículas e HUD com zIndex controlado.
4. **Impacto:** dano e barra de vida seguem um callback visual de contato real e não um temporizador desassociado.
5. **Particles:** textura pré-carregada reutilizável e pool de partículas limitado; sem criar filtros/pixi.Application a cada golpe.
6. **Paleta:** pixelação nítida, contorno definido, luz moderada, sem simular tudo via CSS ou colar vídeo.
7. **Sem Canvas 2D:** o Poké Arena usa createCanvas para alguns recursos, mas o Pokémon Torre mantém a regra do usuário de **somente pixel art com PixiJS/WebGL**.
8. **Sem cópia de terceiros:** criar spritesheets autorais e preservar proveniência das referências técnicas; não incorporar texturas, scripts nem áudio do site observado.

## Arenas: comparação e integração

| Arena estudada | Princípio observado | Possível adaptação no Torre |
|---|---|---|
| Stadium | Gramado com faixas e marcação central | Arena de líder/região ao ar livre |
| Neon | Piso modular com iluminação azul segmentada | Arena tecnológica, usando texturas autorais |
| Crater | Rocha em placas, rachaduras luminosas | Cenários rochosos e vulcânicos |
| Ruins | Pedras envelhecidas, vegetação e fissuras | Ginásios naturais e ruínas regionais |

Não substituir a arena regional V174 aprovada. Trabalhar com novas variações na prévia de teste, até aprovação expressa. Não adotar 3D pesado ou segundo contexto de renderização.

## Plano de produção e avaliação

**Fase A — Inventário:** transformar todos os nomes dos golpes do Torre em catálogo sem duplicatas, com tipo, comportamento, status aprovado, asset existente, referência visual e problema atual. Separar nomes PT/EN.

**Fase B — Motor:** implementar os sete núcleos de animação acima como biblioteca PixiJS compartilhada e pré-carregada, sem mudar os efeitos aprovados.

**Fase C — Pilotos:** testar jato contínuo (Flamethrower), projétil+explosão (Fire Blast), água (Water Gun e Bubble Beam), físico (Cross Chop), área (Discharge), status (Leech Seed) e ambiental (Earthquake), usando sprites próprios.

**Fase D — Cobertura:** converter os demais golpes por família com prévia dentro de batalha e lotes pequenos, preservando os já aprovados.

**Fase E — Qualidade:** capturar vídeos/quadros em combate e medir FPS, uso de texturas, pausa/limpeza, sincronização de dano, múltiplos golpes simultâneos e Android. Sem sinal visual/impacto real, o golpe não entra como aprovado.

## Cautelas de cobertura

A análise de código público inventariou estruturas e recursos, **mas não testou todos os golpes do Poké Arena em batalha**. Muitos dependem de Pokémon ou modos bloqueados. O inventário não prova a fidelidade visual de movimentos individuais. No Torre, nenhuma alteração está implementada por este documento; é um plano e uma referência reprodutível.
