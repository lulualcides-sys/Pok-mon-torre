# Pokémon Torre 2 — especificação de combate baseada em capturas reais do Poké Arena 2D

Data: 20/10/2026. **Escopo: estudo de referências, não clonagem de código ou gráficos de terceiros.**

## Fonte verificável

- [420 vídeos de batalhas em todas as evoluções e Megas](https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39428271235).
- [Catálogo com 153 nomes de golpes e estágios](evolucoes/INDEX.md).
- [Auditoria dos 420 MP4 e diferenças visuais entre quadros](evolucoes/AUDITORIA-VIDEO.md).
- Os arquivos MP4 estão guardados nos oito artefatos (e0–e7) com retenção de 90 dias. A evidência visual é temporária; o catálogo textual persiste na branch.

## Quatro animações observadas no vídeo

| Referência no vídeo | Anatomia do efeito | Como reproduzir com arte original |
|---|---|---|
| Charmander / Charizard — Flamethrower | Pequenas línguas e brasas formando um fluxo contínuo a partir do atacante e na direção do alvo | Sprites de chama com sobreposição espacial, direção, dissipação e trajetória coerente. **Não** usar uma fileira repetida de bolinhas idênticas |
| Charmander — Fire Blast | Projétil brilhante que desloca até perto do alvo, seguido de expansão irregular do fogo | Duas animações distintas (corpo do projétil e impacto) com o instante do dano alinhado ao contato |
| Charizard — Blast Burn | Telegráfico visual amplo e chamas de alta intensidade | Preparação e área de perigo legível; explosão de duração limitada para evitar obstruir HUD |
| Venusaur — Frenzy Plant | Múltiplos pilares/cipós que surgem ao redor de uma área localizada | Vários sprites vegetais animados por instância em arranjo de área; cena limpa depois do impacto |

Estas descrições foram feitas observando as folhas de contato do próprio jogo (não são animações extraídas de seus arquivos de origem). REA havia anotado tempos de sprites específicos, mas os quadros dos vídeos são capturados a 10 FPS; não confundir cadências.

## Motor independente proposto

- Novo jogo em pasta/projeto próprio: **Pokémon Torre 2**, sem substituir o Pokémon Torre original.
- Renderizador: PixiJS/WebGL com sprites pixelados originais e sem Canvas 2D para os efeitos de combate.
- Cena de batalha com z-index separado: terreno, sombra, Pokémon, projéteis, partículas, impactos, HUD.
- Estrutura por golpe: `name/type`, `startup`, `trajectory`, `impact`, `damageFrame`, `recovery`, `duration`, `atlas`, `frames`, `fps`, `scale`, `status`, `approved`.
- **Dano sincronizado ao evento de colisão** no motor próprio; não inferir colisão a partir de posição da imagem.
- Arquivo de arte editável por golpe (LibreSprite); exportação de frames/spritesheets próprios; nada de quadrinhos gerados em tempo real por fórmulas.
- Limites de renderização: agrupar textura por atlas, pool de partículas, limpar objetos após o fim, evitar criar GPU textures no lançamento do ataque e monitorar 60 FPS no celular.

## Campanha Kanto primeiro

1. Protótipo: um cenário jogável inspirado em Pewter, início de uma campanha original, 2 Pokémon em teste, quatro golpes (Flamethrower, Fire Blast, Vine Whip, Razor Leaf), IA, HP e colisão funcional.
2. Prosseguir pelos oito ginásios em progressão narrativa Kanto, com treinadores e líderes, captura de criaturas e desbloqueio de golpes por evolução.
3. Todos os golpes do catálogo devem ser mapeados por forma/estágio. Não tratar os 153 nomes como 153 sprites únicos: cada nome pode conter uma ou mais fases visuais; alguns efeitos são compartilhados.
4. A aprovação de uma animação depende de revisão visual no **combate funcionando**, não apenas de um sprite estático ou de sucesso de teste automatizado.

## Licenciamento e integridade

O estudo de referências não dá permissão automática para copiar os sprites, músicas, código ou demais ativos de Poké Arena 2D. Construir arte e implementação originais e confirmar direitos de uso antes de distribuição. Pokémon e a identidade de Kanto também pertencem aos titulares da franquia.

**Status:** catálogo e auditoria de mídia concluídos. Arquitetura proposta; nenhum protótipo do novo jogo é declarado implementado neste documento.
