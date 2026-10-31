# Validação — Primeiro Despertar

Verificação realizada em 31/10/2026 com agentes especializados e revisão independente.

## Motor e persistência

`npm test`: 13 testes aprovados. Cobrem dano e recompensas, 12 encontros, minichefes 4/8, vitória do colosso, compras com saldo insuficiente, habilidade e recarga, morte e recuperação, renda offline de até oito horas, ausência de recompensas duplicadas, dados inválidos, migração do save português e vinte ciclos completos (240 derrotas de inimigos).

TypeScript e build de produção aprovados. O código anterior de `web/` foi preservado integralmente em `legacy/web/`, com conferência de hashes contra o commit original.

## Interface real

12 cenários E2E com Chromium/Playwright: seleção, detalhes, combate automático sem toques, recarga de 12 segundos, melhorias, relíquia sem compra duplicada, mapa bloqueado, ajuda, configurações e teclado. Inspeções em 1440, 768, 390 e 320 pixels, sem overflow horizontal da página e sem erros JavaScript. Os cartões de heróis no celular usam carrossel horizontal intencional.

A retomada em React StrictMode foi verificada com visibilidade, BFCache, eventos consecutivos e reload, sem duplicar o avanço. O save legado foi migrado em um navegador real, mantendo a chave original intacta.

## Arte e combate

Cenário e três heróis com ilustrações originais. Minichefes com silhuetas, cristais e cores diferentes. Chefão cortado pela borda da arena, laser e abalos; queda de aproximadamente 1,9 segundo antes da tela de vitória. Movimento reduzido verificado. Níveis 5/10 e melhorias de atributos adicionam efeitos visuais ao personagem.

## Offline e publicação

Build servido por HTTP: service worker instalado, conexão desligada, página recarregada, arte/fontes mantidas e combate avançando. O mesmo fluxo passou usando o subcaminho `/infinity-flow/`, equivalente ao GitHub Pages, sem erros de recursos. Os caches são de arquivos estáticos da aplicação; não existe backend.

## Android

APK debug compilado com Java 21/SDK 35. Identificador `br.com.anderflow.infinityflow`, versão 0.1.0, versionCode 2, Android mínimo 6.0. Assinatura v1/v2, integridade ZIP e comparação de todos os 20 arquivos web com `dist/` aprovadas. Os recursos incluem fontes, arte, ambos os workers e licenças OFL.

A execução em aparelho físico ou emulador Android não foi realizada. A assinatura de desenvolvimento não é uma chave de produção; uma instalação anterior assinada por outra chave não aceita atualização direta.

## Escopo

A primeira região é jogável e repetível. Os mundos seguintes são caminhos futuros indicados no mapa, sem batalhas implementadas. O progresso fica no dispositivo, sem sincronização entre aparelhos.
