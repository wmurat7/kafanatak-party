@echo off
chcp 65001 > nul
title Kafana Tak! - Parti Oyunu Sunucusu
echo ========================================================
echo 🎉 Kafana Tak! Parti Oyunu Başlatılıyor...
echo ========================================================
cd /d "%~dp0"
node server.js
pause
