@echo off
chcp 65001 > nul
title Kafana Tak! - Android APK Üretici
echo ========================================================
echo 📱 Kafana Tak! Android APK Derleniyor...
echo ========================================================
cd /d "%~dp0"
node tools/bundle-mobile.cjs
call npx cap sync android
cd android
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
call gradlew.bat assembleDebug
cd ..
copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "KafanaTak-v1.0.apk" > nul
echo.
echo ========================================================
echo 🎉 APK Derleme Tamamlandı!
echo 📂 Çıktı Konumu:
echo    %~dp0KafanaTak-v1.0.apk
echo ========================================================
echo 🌐 7/24 Bulut Sürümü GitHub Releases'e Güncelleniyor...
where gh >nul 2>nul
if %errorlevel% equ 0 (
  gh release upload v1.0.0 "KafanaTak-v1.0.apk" --repo wmurat7/kafanatak-party --clobber
  echo ✓ Bulut İndirme Linki Güncellendi (7/24 Kesintisiz Aktif)!
) else (
  echo (GitHub CLI bulunamadı, yerel build tamamlandı.)
)
echo ========================================================
pause
