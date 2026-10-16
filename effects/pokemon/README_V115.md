# V115 — acabamento global de sprites Pokémon

O usuário solicitou explicitamente, em 16/10/2026, o acabamento de **todos os Pokémon**, seguindo o padrão aprovado no Mewtwo V95: pixels nítidos (nearest-neighbor), contorno escuro de 1px, leve luz superior, contraste, saturação e sombreamento inferior.

- **Mewtwo ID 150:** preserva exatamente `visual-polish-v95.js`. Não há dupla aplicação do acabamento.
- **Outros IDs de Pokémon presentes no jogo:** acabamento `visual-polish-v115.js` usa o mesmo algoritmo e parâmetros visuais V95, aplicado somente no `drawMon` original. Os sprites, poses, quadros, cores de shiny, facing, direção, escala, animações de ataque, dano e hitboxes **não são substituídos**.
- Performance: cache lazy somente dos quadros usados; limite global de **24 MiB**, cache por imagem de no máximo 32 quadros; descarte LRU e fallback para sprite original em erro/CORS; tanto modo normal quanto seguro.
- `?pokemon_polish=off` permite comparar com os sprites anteriores sem alterar salvamentos.
- Os sprites originais são a fonte, não há CSS falso, vídeo, PNG ilustrativo, redraw por espécie ou edição de golpes. O padrão Mewtwo V95 permanece congelado.

A versão não cria novas poses ausentes; apenas melhora a apresentação de todas as poses que já existem. Testar Pokémon variados e desempenho real em Android para ajustes posteriores.
