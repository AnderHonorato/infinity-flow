# Infinity Flow

**Infinity Flow** é um RPG incremental original de batalha automática, com renderização 2D artesanal em Canvas, heróis evolutivos, árvore de caminhos e progresso offline.

## Capítulo I — O Despertar do Abismo
- 3 heróis jogáveis: Astra, Kael e Nix, com armas e cores distintas.
- Raça Umbral, 12 encontros, minibosses nas ondas 4 e 8.
- Vor'Kal, titã do penhasco: olho disparando laser, ataques de terreno e queda animada.
- Combate automático, toque opcional, habilidades com recarga, melhorias, raridade visual conforme nível.
- Progressão de níveis sem nível máximo definido e economia com multiplicadores.
- Simulação offline limitada a oito horas ao reabrir o jogo. O chefe final exige luta ativa.
- Mapa ramificado de capítulos; conclusão do capítulo libera as rotas futuras.
- Interface responsiva, instalação PWA e base Android com Capacitor.

## Executar web
Abra `web/index.html` ou, para testar também o modo instalável/offline, inicie um servidor HTTP: `npx serve web`.

## APK pelo GitHub Actions
No menu **Actions**, execute **Publicar Infinity Flow** ou envie um commit para main. O workflow gera um APK Android de depuração e o anexa como artefato. A versão web está publicada em https://infinity-flow-ghisap.v2.appdeploy.ai/. O APK debug utiliza assinatura de teste do Android e não é destinado à distribuição comercial.

## Android local
```sh
npm install
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

## Estrutura
- `web/index.html`: marcação da aplicação;
- `web/estilos.css`: identidade visual e animações;
- `web/jogo.js`: lógica de combate, desenho e salvamento;
- `web/servico-worker.js`: cache de funcionamento offline;
- `docs/AGENTES.md`: divisão por especialidades, escopo e critérios de qualidade.

Toda a experiência de jogo foi escrita em português brasileiro. Inspiração: elementos de jogos incrementais e cenários vivos, sem reutilizar marca, personagem ou arte de terceiros.

**Escopo entregue:** primeira fase jogável. Os demais mundos aparecem como caminhos futuros, mas serão implementados individualmente.
