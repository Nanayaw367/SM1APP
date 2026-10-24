#!/usr/bin/env bash
# EduTab Fleet - Local Android APK Build Script
# Requirements: Node.js 18+, JDK 17+, Android SDK (or Android Studio)

set -e

echo "=== EduTab Fleet Android APK Builder ==="
echo "1. Building web production bundle..."
npm run build

echo "2. Installing Capacitor Android dependencies..."
npm install --save-dev @capacitor/core @capacitor/cli @capacitor/android

if [ ! -d "android" ]; then
  echo "3. Initializing Android native project..."
  npx cap init "EduTab Fleet" "com.edutab.fleet" --web-dir dist
  npx cap add android
else
  echo "3. Syncing web build to Android native project..."
  npx cap sync android
fi

echo "4. Assembling Android APK with Gradle..."
cd android
chmod +x gradlew
./gradlew assembleDebug

echo "=== SUCCESS! ==="
echo "Your installable Android APK is located at:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
