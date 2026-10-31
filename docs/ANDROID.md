# Infinity Flow no Android

O projeto nativo usa Capacitor 7, Java 21, Android SDK 35 e Gradle 8.11.1. O identificador do aplicativo é `br.com.anderflow.infinityflow`. A interface e os recursos do jogo são incluídos no APK; não é necessário servidor web para jogar.

## Compilar

Instale Java 21 e Android Studio (ou Android SDK Command-line Tools), depois instale os pacotes oficiais:

```sh
sdkmanager 'platforms;android-35' 'build-tools;34.0.0' 'build-tools;35.0.0' 'platform-tools'
sdkmanager --licenses
export ANDROID_HOME="$HOME/Android/Sdk"
npm ci
./scripts/build-android.sh
```

O script compila a interface, sincroniza os arquivos para o projeto Android, gera um APK debug assinado e verifica sua assinatura. A saída fica em `artifacts/infinity-flow.apk`; o SHA-256 e os metadados ficam na mesma pasta. `android/local.properties` contém caminhos locais e não deve ser versionado.

Em redes que exigem proxy HTTP, o Gradle/Java pode precisar dos parâmetros correspondentes em `GRADLE_OPTS`, por exemplo `-Dhttps.proxyHost=proxy -Dhttps.proxyPort=8080 -Dhttp.proxyHost=proxy -Dhttp.proxyPort=8080`. Não inclua credenciais de proxy no repositório.

## Instalar

Transfira `infinity-flow.apk` para um aparelho Android 6.0 ou superior e abra o arquivo. Autorize a instalação de aplicativos pela origem usada para abrir o APK. Com depuração USB habilitada, também é possível instalar com:

```sh
adb install -r artifacts/infinity-flow.apk
```

Esta entrega é um APK debug instalável, assinado com a chave de desenvolvimento do ambiente de compilação. Para publicar na Play Store, gere um Android App Bundle de release com uma chave de produção preservada pelo proprietário. Um novo APK assinado com outra chave exige desinstalar a versão anterior, o que apaga os dados locais.

## Verificações

A verificação estática usa `apksigner verify --verbose`, `aapt dump badging` e comparação dos arquivos web empacotados com `dist/`. Ela confirma assinatura, estrutura, identificador, versão e inclusão dos recursos. A execução em aparelho Android continua sendo uma verificação distinta.
