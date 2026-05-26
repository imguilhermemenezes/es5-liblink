@echo off
:: Configura o encoding para UTF-8 para exibir acentos corretamente no Prompt de Comando do Windows
chcp 65001 > nul
title Liblink - Parar Servidores

echo =================================================================
echo             🛑 PARANDO OS SERVIDORES DO LIBLINK 🛑               
echo =================================================================
echo.
echo   Finalizando os processos em segundo plano do PHP e Node.js...

:: Encerra de forma forçada os processos do PHP (Laravel) e Node (Vite)
taskkill /f /im php.exe >nul 2>nul
taskkill /f /im node.exe >nul 2>nul

echo.
echo   [✅ SUCESSO] Os servidores do Liblink foram encerrados com sucesso!
echo   Pode fechar esta janela agora.
echo.
timeout /t 3 /nobreak > nul
exit
