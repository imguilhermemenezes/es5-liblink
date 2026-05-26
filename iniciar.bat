@echo off
:: Configura o encoding para UTF-8 para exibir acentos corretamente no Prompt de Comando do Windows
chcp 65001 > nul
title Liblink - Inicializador Automático

echo =================================================================
echo                🚀 INICIALIZADOR AUTOMÁTICO DO LIBLINK 🚀         
echo =================================================================
echo.

:: 1. Verificar se o PHP está instalado
where php >nul 2>nul
if %errorlevel% neq 0 goto err_php

:: 2. Verificar se o Composer está instalado
where composer >nul 2>nul
if %errorlevel% neq 0 goto err_composer

:: 3. Verificar se o Node.js/NPM está instalado
where npm >nul 2>nul
if %errorlevel% neq 0 goto err_node


:: 4. Configuração do Back-end
echo [1/4] Configurando o Back-end (Laravel)...
cd backend

if not exist .env (
    echo     -> Criando arquivo .env a partir do .env.example...
    copy .env.example .env > nul
    echo.
    echo     ⚠️  [IMPORTANTE] Um novo arquivo backend/.env foi criado.
    echo     ⚠️  Abra-o e edite as credenciais do banco de dados (DB_DATABASE, DB_USERNAME, DB_PASSWORD)
    echo        se elas forem diferentes do padrão (banco: liblink, usuário: root, sem senha).
    echo.
)

if not exist vendor (
    echo     -> Dependências do PHP (Composer) não encontradas. Instalando...
    echo        (Isso pode levar alguns minutos na primeira execução)
    call composer install
) else (
    echo     -> Dependências do PHP (Composer) já estão instaladas.
)

:: Gerar chave da aplicação se a APP_KEY estiver vazia ou não configurada
findstr /C:"APP_KEY=base64" .env > nul
if %errorlevel% neq 0 (
    echo     -> Gerando chave única da aplicação Laravel...
    php artisan key:generate
)

cd ..

:: 5. Configuração do Front-end
echo.
echo [2/4] Configurando o Front-end (React + Vite)...
cd frontend

if not exist node_modules (
    echo     -> Dependências do Node (NPM) não encontradas. Instalando...
    echo        (Isso pode levar alguns minutos na primeira execução)
    call npm install
) else (
    echo     -> Dependências do Node (NPM) já estão instaladas.
)

cd ..

:: 6. Configuração do Banco de Dados
echo.
echo [3/4] Configuração do Banco de Dados...
echo     -> ATENÇÃO: Certifique-se de que o MySQL do seu XAMPP ou Laragon está LIGADO!
echo     -> Certifique-se também de ter criado o banco de dados chamado "liblink" no seu phpMyAdmin/MySQL.
echo.
set /p criar_banco="Deseja criar as tabelas no banco de dados agora? (s/n): "
if /i "%criar_banco%"=="s" (
    cd backend
    echo.
    echo     -> Executando migrações do Laravel...
    php artisan migrate
    cd ..
)

:: 7. Inicializando os servidores ocultos (em background)!
echo.
echo [4/4] Inicializando os servidores em segundo plano...
echo.

:: Cria um script temporário VBScript para rodar as janelas em modo 100% oculto
echo Set WshShell = CreateObject("WScript.Shell") > temp_run.vbs
echo WshShell.Run "cmd /c cd backend && php artisan serve", 0, false >> temp_run.vbs
echo WshShell.Run "cmd /c cd frontend && npm run dev", 0, false >> temp_run.vbs

:: Executa o script oculto e depois deleta o arquivo temporário
wscript.exe temp_run.vbs
del temp_run.vbs

echo =================================================================
echo   🎉 [SUCESSO] Os servidores estão rodando silenciosamente!
echo   💻 Backend: http://localhost:8000
echo   🌐 Frontend: http://localhost:5173
echo.
echo   Aguardando 3 segundos para abrir o navegador automaticamente...
echo =================================================================

timeout /t 3 /nobreak > nul

:: Abre o navegador padrão na porta do frontend
start http://localhost:5173

echo.
echo   Tudo pronto! Esta janela irá se fechar automaticamente.
echo   Nenhuma janela preta ficará aberta na sua barra de tarefas.
echo.
timeout /t 3 /nobreak > nul
exit

:err_php
echo [❌ ERRO] O PHP não está instalado ou não está configurado no PATH do sistema.
echo Por favor, instale o PHP (versão 8.2 ou superior) ou use o XAMPP/Laragon antes de prosseguir.
echo.
pause
exit /b

:err_composer
echo [❌ ERRO] O Composer não está instalado ou não está configurado no PATH do sistema.
echo Por favor, instale o Composer (https://getcomposer.org/) antes de prosseguir.
echo.
pause
exit /b

:err_node
echo [❌ ERRO] O Node.js/NPM não está instalado ou não está configurado no PATH do sistema.
echo Por favor, instale o Node.js (https://nodejs.org/) antes de prosseguir.
echo.
pause
exit /b
