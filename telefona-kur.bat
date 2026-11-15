@echo off
chcp 65001 > nul
title Kafana Tak! - Telefona APK Derle ve Kur
echo ========================================================
echo Kafana Tak! Telefona Yukleme Baslatiliyor...
echo ========================================================
cd /d "%~dp0"

set "ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if not exist "%ADB_PATH%" (
    set "ADB_PATH=adb"
)

echo 1/5. Web varliklari paketleniyor (bundle-mobile)...
call node tools/bundle-mobile.cjs
if %errorlevel% neq 0 (
    echo [HATA] Web varliklari paketlenemedi!
    pause
    exit /b %errorlevel%
)

echo.
echo 2/5. Capacitor Android senkronize ediliyor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [HATA] Capacitor sync basarisiz!
    pause
    exit /b %errorlevel%
)

echo.
echo 3/5. Android APK derleniyor (Gradlew)...
cd android
if exist "C:\Program Files\Android\Android Studio1\jbr" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio1\jbr"
) else (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
)
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [HATA] Gradle derleme basarisiz!
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..

copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "KafanaTak-v1.0.apk" > nul

echo.
echo 4/5. Telefon baglantisi kontrol ediliyor ve APK yukleniyor...
"%ADB_PATH%" devices
"%ADB_PATH%" install -r "KafanaTak-v1.0.apk"
if %errorlevel% neq 0 (
    echo [HATA] APK telefona yuklenemedi. Lutfen USB Hata Ayiklamayi kontrol edin.
    pause
    exit /b %errorlevel%
)

echo.
echo 5/5. Uygulama telefonda baslatiliyor...
"%ADB_PATH%" shell monkey -p com.kafanatak.party -c android.intent.category.LAUNCHER 1 > nul 2>&1

echo.
echo ========================================================
echo TEBRIKLER! Kafana Tak! basariyla kuruldu ve acildi.
echo ========================================================
pause
