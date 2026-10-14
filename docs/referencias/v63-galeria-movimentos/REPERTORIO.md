# Galeria de sprites — Pokémon Torre

**Status:** referências guardadas, **não integradas automaticamente aos golpes**.

- **18 arquivos arquivados:** 14 folhas WEBP e 4 GIFs.
- **Originais:** Biblioteca privada `/Pokémon Torre/Galeria/Referencias V63 2026-10-14`.
- **Índice detalhado:** [manifest.json](./manifest.json), com identificação e associação por IDs reais do catálogo de golpes.
- **Preservação:** nenhum sprite ou movimento já aprovado deve ser substituído sem autorização.
- **Direitos:** os arquivos de terceiros foram mantidos apenas como referências privadas, inclusive marcas d'água; antes de usar publicamente, conferir licença ou criar arte original inspirada no conceito.

## Melhor correspondência para golpes atuais

| Referência | Efeito da folha/GIF | Golpes que combinam |
|---|---|---|
| `1000982591.webp` | fogo, brasa e lava | Brasa; Brasa Viva; Fire Spin |
| `1000982592.webp` | erupção, calor e explosão | Explosão Magmática; Fire Spin |
| `1000982595.webp` | furacão / flor / escudo de fogo | **Fire Spin**; Chama Circular; Protect (somente versão temática) |
| `1000982596.webp` | pequenas chamas, pilares e poças | **Brasa**; Chamas de Moltres; Explosão Magmática |
| `1000982597.webp` | bola flamejante, fênix e magma | **Chamas de Moltres**; Explosão Magmática |
| `1000982598.webp` | explosão, onda azul, gás verde | **Explosion**; Pulso de Água; Ácido |
| `1000982599.webp` | explosão circular, impacto azul e gás | **Explosion**; Pulso de Água; Ácido |
| `1000982600.webp` | explosão gigante, raio e fumaça | **Explosion**; Thunderbolt |
| `1000982603.webp` | espadas, socos, ácido e bolhas | **Swords Dance**; Corte X; Ácido; Bolhas |
| `1000982604.webp` | cubo mágico, chamas, veneno | **Protect**; Will-O-Wisp; Ácido; Hex |
| `1000982605.webp` | eletricidade, explosões, espinhos e escudos | **Thunderbolt**; Explosion; Protect; Hex |
| `1000982606.webp` | bambu, esfera, vento e gelo | **Protect**; Campo Gelado; Caco de Gelo |
| `1000982607.webp` | lança, esfera, flechas, cura e gelo | **Aura Sphere**; Agulhas; Recover; Caco de Gelo |
| `1000982610.webp` | cura, mana, buff, reviver, imunidade | **Recover**; Synthesis; Bulk Up; Calm Mind; Protect |
| `1000982590.gif` | várias animações de fogo (333 frames) | Brasa; Chama Ardente; Fire Spin |
| `1000982452.gif` | efeitos gelados, elétricos e mágicos | Caco de Gelo; Aura Sphere; Pulso de Água |
| `1000982451.gif` | chamas e pontas de pedra | Brasa; Fire Spin; Agulhas |
| `1000982450.gif` | escudo mágico e pontas | Protect; Barreira Psíquica; Agulhas |

## Regras para integração futura

1. Conferir se o golpe já tem versão **aprovada**; se tiver, não substituir automaticamente.
2. Escolher sequência com **movimento e alvo condizentes**: projétil viaja do usuário ao inimigo, status acontece sobre o alvo, proteção acompanha o usuário.
3. Transformar o GIF/folha licenciada ou arte original em atlas otimizado (8 a 12 quadros), mantendo fundo transparente; arquivos enormes não devem ser decodificados durante o ataque, para evitar queda de FPS.
4. Usar arquivo isolado por golpe; retirar o visual anterior **apenas no golpe editado**, sem alterar dano, cooldown ou habilidades.
5. Validar no navegador e celular, e solicitar aprovação visual quando for alterar um golpe existente.

**Atualização do catálogo:** 14 de outubro de 2026.
