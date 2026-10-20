# Poké Arena 2D — sessão local de pesquisa com elenco completo

**Resultado verificado (20/10/2026):** uma sessão Chrome inteiramente nova, sem login e sem dados de outros usuários, passou de **4/26** para **26/26** Pokémon selecionáveis no Training. Um personagem antes bloqueado (índice 3, Zubat) foi selecionado e entrou na batalha.

## Evidência

- [Teste de desbloqueio em navegador descartável](https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39422974085) — artefato `rea-sandbox-local-unlock-proof`, capturas antes/depois e JSON com 4/26 vs 26/26.
- [Coleta de movimentos dos 22 personagens adicionais](https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39424358851) — quatro lotes (`g0`, `g1`, `g2`, `g3`), cada um verificável nos artefatos do workflow.
- [Piloto com Zubat](https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39424192101).

## Como funciona a prova

O site público usa a progressão da League, que também é salva no próprio browser. Para a pesquisa, o script configura um estado local temporário **antes de carregar** a aplicação em um perfil de navegador novo. Os testes não alteram o back-end, a conta de terceiros, credenciais, matchmaking online ou o progresso pessoal do usuário.

O objetivo é registrar sequências visuais **em batalha real**, preservando nomes e evidências. As gravações de comandos são tentativas: movimento do personagem ou alteração de pixels não é prova isolada de que uma habilidade específica foi ativada.

## Regras de referência

As capturas servem para **estudar** animações e reconstruir efeitos autorais no Pokémon Torre. Nenhuma spritesheet ou código de terceiros é inserido no Pokémon Torre automaticamente. Os golpes aprovados permanecem inalterados.

## Estado da captura completa

O resultado 26/26 está confirmado. A criação de vídeos para todos os controles dos personagens adicionais é uma etapa separada; ela só deve ser declarada concluída quando os vídeos e os relatórios individuais forem inspecionados. Artefatos expiram conforme o período definido no GitHub Actions.
