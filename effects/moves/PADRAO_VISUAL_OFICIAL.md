# PADRÃO VISUAL OFICIAL — MOVES DO POKÉMON TORRE

**Referência central:** os golpes **Bolhas** e **Pistola d’Água** da V128, aprovados pelo usuário.

> **Primeiro ser fiel ao que o golpe faz. Depois ficar bonito.** O resultado precisa ser
> imediatamente reconhecível durante a luta, mesmo quando o efeito é simples.

## Referências técnicas que devemos reproduzir

- Bolhas: `effects/moves/v128-water-preview/bubbles/index.js`
  - 17 bolhas separadas, tamanhos e atrasos diferentes, trajetória de origem até o alvo,
    brilho/transparência e estouro em gotículas exatamente no contato.
  - O acerto tem partículas pequenas. **Não** substituir por uma esfera gigante ou raio genérico.
- Pistola d’Água: `effects/moves/v128-water-preview/water-gun/index.js`
  - Um único jato estreito e contínuo com leve ondulação e quatro espessuras/cores
    (`#0b2e49`, `#1f8ec9`, `#62d6fb`, `#efffff`).
  - Algumas gotículas secundárias, pequeno respingo e anel de impacto no alvo.
  - **Não** confundir com Hydro Pump, tsunami ou feixe luminoso.
- A V128 usa **JavaScript + Canvas 2D dinâmico** e 16 quadros de referência; essas
  animações originais são funcionais e estão aprovadas. O renderer não precisa ser
  trocado para estabelecer o padrão. PixiJS/WebGL, LibreSprite, Python e CSS podem
  ser usados quando MELHORAREM o efeito, sem alterar o significado ou a legibilidade.

## Regras obrigatórias para qualquer move novo ou reformulado

1. **Observar o golpe original primeiro.** Identificar se é jato, rajada, esfera,
   contato corporal, bolhas, chuva, ondas, suporte/status etc. Sua silhueta e seu
   comportamento devem corresponder à animação original do Pokémon.
2. **Uma ideia principal por golpe.** Bolhas = várias bolhas. Pistola d’Água =
   um fio d’água constante. Lança-Chamas = fluxo contínuo de fogo. Soco = contato
   físico real. Não trocar essas ações por círculos, espinhos, explosões ou feixes
   apenas porque são mais fáceis de programar.
3. **Simples, legível, porém caprichado.** Priorizar formato, escala, movimento,
   cores e contorno antes de bloom, câmera, partículas adicionais ou quantidade
   arbitrária de quadros.
4. **Trajetória visível e alvo real.** A animação começa no Pokémon, alcança o
   adversário, e o dano deve coincidir com o contato; depois dissipa sem cobrir
   interface ou persistir ao final da batalha.
5. **Camadas sutis.** Corpo do efeito + uma variação orgânica discreta + poucas
   partículas secundárias + impacto proporcional. Nada de grandes explosões
   ou detalhes que disfarcem o golpe.
6. **Identidade própria.** Água parece água, fogo parece fogo, elétrico parece
   descarga elétrica; cada move tem forma, velocidade e comportamento específicos.
7. **Desempenho e ritmo.** Alvo de 60 FPS; sem travamentos ao usar golpes.
   Não criar atlas pesado ou loops excessivos se a mesma animação puder ser
   feita com poucos elementos dinâmicos e bom acabamento.
8. **Quadros pelo mérito, não por obrigação.** Os 16 quadros da V128 funcionam
   bem porque o movimento está correto. Usar 24 para movimentos complexos
   e 32 para cinematográficos *quando houver variações reais*; não multiplicar
   quadros semelhantes nem alongar artificialmente golpes simples.
9. **Prévia dentro da batalha.** Mostrar o golpe jogável no ambiente e com
   tamanho real antes de aprovar ou substituir qualquer versão já aceita.
10. **Proteção de versões aprovadas.** Respeitar `effects/moves/STATUS_APROVADOS.json`.
    Nunca redesenhar Bolhas, Pistola d’Água ou outros golpes aprovados sem nova
    autorização explícita do usuário.

## Checklist de aceitação

- Ao ver a animação, reconheço o golpe original sem ler o nome?
- O movimento principal é claro, contínuo/fragmentado/concentrado conforme o golpe?
- Ele percorre a distância correta e acerta no momento visual do impacto?
- O tamanho é proporcional aos Pokémon e não cobre o menu?
- As cores, contornos e partículas melhoram a leitura, em vez de distrair?
- O jogo mantém FPS e a campanha original?
- O usuário aprovou o movimento NA BATALHA?

**Critério decisivo:** Bolhas e Pistola d’Água foram elogiados por serem
**simples e fiéis ao golpe**, não por complexidade gráfica. Todas as futuras
animações devem partir desse mesmo princípio.
