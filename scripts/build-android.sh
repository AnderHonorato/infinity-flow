#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -x "${JAVA_HOME:-}/bin/javac" ]] && ! command -v javac >/dev/null 2>&1; then
  echo 'A Java 21 JDK with javac is required. Set JAVA_HOME to the JDK directory.' >&2
  exit 1
fi

# Android Studio normally installs the SDK here; CI can set either variable.
ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
export ANDROID_HOME ANDROID_SDK_ROOT="$ANDROID_HOME"
if [[ ! -d "$ANDROID_HOME/platforms/android-35" ]]; then
  echo 'Android SDK API 35 is required. Set ANDROID_HOME to your SDK directory.' >&2
  exit 1
fi

npm run build
npx cap sync android
(cd android && ./gradlew :app:assembleDebug --no-daemon)

build_tools="$ANDROID_HOME/build-tools/35.0.0"
"$build_tools/apksigner" verify --verbose android/app/build/outputs/apk/debug/app-debug.apk
mkdir -p artifacts
cp android/app/build/outputs/apk/debug/app-debug.apk artifacts/infinity-flow.apk
"$build_tools/aapt" dump badging artifacts/infinity-flow.apk > artifacts/android-package.txt
(cd artifacts && sha256sum infinity-flow.apk > infinity-flow.apk.sha256)
printf 'APK ready: %s/artifacts/infinity-flow.apk\n' "$PWD"
