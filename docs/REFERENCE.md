# Referência visual e entrega

Investigação somente leitura de fontes externas em 31/10/2026. Nenhuma alteração foi feita no GitHub ou no Drive durante esta investigação.

## Meu Claudinho

Fonte: https://meuclaudinho.com.br/ . Inspecionado com Firecrawl (branding, HTML e screenshot) e Chromium/Playwright em 1440 × 1000, inclusive troca para Galáxia Distante e clique no fundo. Capturas locais: `artifacts/reference-claudinho.png`, `artifacts/reference-claudinho-galaxy.png`, `artifacts/reference-claudinho-themes.png`.

Valores extraídos da folha CSS:

| Papel | Valor |
| --- | --- |
| Fundo | `#121110` |
| Superfícies | `#181715`, `#1f1e1c` |
| Texto principal/secundário | `#ecebe7`, `#b8b5ae` |
| Destaque/destaque claro | `#d97757`, `#e8936f` |
| Botão | `#b85636` |
| Bordas | branco com 8% e 14% |
| Easing | `cubic-bezier(.22,.8,.24,1)` |
| Botão | raio 12px; padding 14px × 22px; transição 200ms |
| Brilho de cartão | gradiente radial 260px seguindo ponteiro; destaque com 16% |

Tipografia verificada por `getComputedStyle`: Inter no corpo e títulos; Instrument Serif itálico nas palavras destacadas; Geist Mono nos rótulos. O scraper não identificou a serifada; inspeção no navegador resolveu a lacuna.

Padrões observados:

- Fundo Canvas com pequenos ladrilhos ASCII, partículas, grade e luz ambiente; o efeito continua atrás do conteúdo. Tema Galáxia Distante muda para azul/violeta e reage ao clique com feixes radiais de aceleração. Amostras dos pixels de Canvas mudaram ao longo do tempo e após a interação.
- Texto branco amplo, poucas cores de destaque, vidro discreto e bordas finas. Painéis escuros mantêm a leitura sobre o movimento.
- Revelação das palavras por máscara `clip-path`, entrada dos painéis e paralaxe. Botões elevam e brilham no hover; cartões seguem o ponteiro com um halo.
- Mascote em pixel reage às interações. Há sequências explicativas de 7s e ícones girando em 2,4s. A introdução pode ser pulada; existem regras de movimento reduzido nas demos.

Aplicação proposta para Infinity Flow (decisões de design, sem copiar a arte): manter teal e dourado do jogo; fundo de batalha em camadas com bruma lenta, estrelas/brasas e brilho que respira; onda de energia curta ao toque; painel de controles legível com vidro leve; silhuetas originais; pequenos movimentos de repouso nos heróis; chefe com antecipação visual, disparo e dissipação; recargas fáceis de ler; desativar movimentos decorativos com `prefers-reduced-motion`. No celular, limitar partículas, resolução efetiva do Canvas e trabalho fora da aba ativa. Não reutilizar mascote, imagens, código de animação ou identidade do site.

## Estado do GitHub existente

Fonte: https://github.com/AnderHonorato/infinity-flow . Repositório público, branch padrão `main`, permissões autenticadas de push e administração. Árvore capturada `34cb37c28b385e0804ba8dd9f256c5acebb8f479`.

Já há um jogo completo inicial em `web/`: HTML, CSS, `jogo.js` (~39KB), ícone, manifest e service worker. README descreve Astra/Kael/Nix, 12 encontros, minibosses 4 e 8, Vor'Kal, primeira fase jogável e caminhos futuros. Existem arquivos `.github/agents/*.agent.md` e `docs/AGENTES.md` com responsabilidades e critérios; não há `AGENTS.md` na árvore capturada.

Pontos de compatibilidade:

- Identificador Android atual: `br.com.anderflow.infinityflow`. Nome Infinity Flow. Capacitor 7.4.4; `webDir` anterior `web`.
- Save anterior: localStorage `infinity-flow-salvo-v1`, objeto `versao:1`, campos `heroi`, `escolhido`, `ouro`, `essencia`, `nivel`, `xp`, `ultimoRegistro` entre outros. Limite offline de oito horas.
- Service worker anterior: pathname `servico-worker.js`, cache `infinity-flow-v1`, cache-first com HTML/CSS/JS antigos. Uma migração na mesma URL precisa atualizar esse worker para que clientes existentes recebam os arquivos novos.
- Workflow `.github/workflows/publicar.yml` roda em push main e workflow_dispatch; verifica `web/jogo.js`, gera projeto Android e APK debug, entrega artefato `Infinity-Flow-APK`. Workflow `github-pages.yml` publica `web/`. Para React/Vite, adaptar comandos e diretório de saída sem apagar o histórico ou sobrescrever silenciosamente estes arquivos.

## Upload do APK no Drive

Ferramentas disponíveis e schemas inspecionados, sem upload realizado:

```js
await tools.mcp__codex_apps__google_drive_upload_file({
  file_uri: "/workspace/artifacts/infinity-flow.apk",
  file_name: "infinity-flow.apk",
  mime_type: "application/vnd.android.package-archive"
});
```

`parent_folder_id` pode ser omitido para My Drive. Quando usado, aceita ID real de pasta, não URL nem literal `root`. O schema de `file_uri` é string; a descrição contém instruções contraditórias de referência estruturada e caminho, mas termina explicitamente pedindo caminho local absoluto. Usar o caminho acima e tratar o resultado real como autoridade, sem afirmar sucesso antecipadamente.

Após o upload, guardar o ID/URL retornado e verificar:

```js
await tools.mcp__codex_apps__google_drive_get_file_metadata({
  fileId: idRetornado,
  fields: "id,name,mimeType,size,md5Checksum,webViewLink,webContentLink,permissions"
});
```

Comparar tamanho e hash com o APK local e devolver somente URL observada no resultado/readback. Um link em My Drive funciona para o proprietário conectado sem alterar compartilhamento. A ferramenta `share_file` oferece somente usuário específico (`user_email`) ou domínio Workspace (`anyone_at_company:true`) com permissões reader/writer/commenter/owner; ela não oferece público/anyone-with-link. Não ampliar o compartilhamento nem inventar email. Se for necessário acesso público, a capacidade precisa ser confirmada por outro caminho autorizado.

Não imprimir bytes base64, credenciais nem URLs temporárias assinadas. Não importar o APK como Google Doc. `update_file(fileId,file_uri,mime_type)` serve para substituir bytes de um arquivo já existente e manter seu link; usar apenas quando esse arquivo anterior tiver sido identificado.

## Integração preparada

O clone de referência está em `/tmp/infinity-flow-upstream`, feito sem mutações remotas. A autenticação `gh` foi confirmada para AnderHonorato por HTTPS. O histórico deve continuar a partir do `main` existente, preferencialmente em uma nova branch de trabalho. Antes de copiar a aplicação React, mover `web/` para `legacy/web/` dentro do clone, preservando os arquivos de `.github/agents/` e `docs/AGENTES.md`. O overlay deve excluir `node_modules`, `dist`, artefatos gerados, `.git`, diretórios Android `build`/`.gradle` e `local.properties`. Fazer commit dos fontes e do wrapper Gradle, preservando o commit pai do remoto; não usar force push.

Os workflows preparados em `.github/workflows/` mantêm os nomes e as funções dos anteriores. `publicar.yml` executa instalação por lockfile, testes, build e APK em Java 21/SDK 35; valida assinatura e gera checksum/metadados no artefato. `github-pages.yml` publica `dist/` e usa o caminho informado pelo GitHub Pages no argumento `--base` do Vite. Ambos foram analisados como YAML; a execução real depende do push e é verificação separada.
