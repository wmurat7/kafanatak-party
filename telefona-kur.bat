@echo off
chcp 65001 > nul
title Kafana Tak! - Telefona APK Derle ve Kur
echo ========================================================
echo 📱 Kafana Tak! Telefona Yükleme Başlatılıyor...
echo ========================================================
cd /d "%~dp0"

set "ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if not exist "%ADB_PATH%" (
    set "ADB_PATH=adb"
)

echo 1/5. Web varlıkları paketleniyor (bundle-mobile)...
node tools/bundle-mobile.cjs
if %errorlevel% neq 0 (
    echo [HATA] Web varlıkları paketlenemedi!
    exit /b %errorlevel%
)

echo.
echo 2/5. Capacitor Android senkronize ediliyor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [HATA] Capacitor sync başarısız!
    exit /b %errorlevel%
)

echo.
echo 3/5. Android APK derleniyor (Gradlew)...
cd android
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [HATA] Gradle derleme başarısız!
    cd ..
    exit /b %errorlevel%
)
cd ..

copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "KafanaTak-v1.0.apk" > nul

echo.
echo 4/5. Telefon bağlantısı kontrol ediliyor ve APK yükleniyor...
"%ADB_PATH%" devices
"%ADB_PATH%" install -r "KafanaTak-v1.0.apk"
if %errorlevel% neq 0 (
    echo [HATA] APK telefona yüklenemedi. Lütfen telefonun USB ile bağlı ve USB Hata Ayıklama (Debugging) açık olduğundan emin olun.
    exit /b %errorlevel%
)

echo.
echo 5/5. Uygulama telefonda başlatılıyor...
"%ADB_PATH%" shell am start -n com.kafanatak.party/.MainActivity

echo.
echo ========================================================
echo 🎉 BAŞARILI! Kafana Tak! güncel haliyle telefona kuruldu ve açıldı.
echo ========================================================

