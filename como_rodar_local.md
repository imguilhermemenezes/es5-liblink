# Guia de Configuração e Inicialização do Liblink Localmente

Este guia detalha tudo o que você precisa fazer para rodar o **Liblink** do zero em qualquer outra máquina Windows de forma 100% silenciosa, limpa e profissional.

---

## 🛠️ 1. Pré-requisitos (O que instalar no outro computador)

Antes de começar, a máquina precisa ter as seguintes ferramentas instaladas:

1. **Git**: Para clonar o projeto do repositório.
   - 🔗 [Baixar Git para Windows](https://git-scm.com/download/win)
2. **Node.js (LTS)**: Necessário para rodar o front-end em React.
   - 🔗 [Baixar Node.js](https://nodejs.org/)
3. **Laragon (Recomendado)**: Para rodar o servidor MySQL (banco de dados) e o PHP de forma extremamente leve e automática.
   - 🔗 [Baixar Laragon Full](https://laragon.org/download/)
   - *Nota: O Laragon já vem com PHP, MySQL e Composer integrados, você não precisa instalar o Composer separado!*

---

## 📥 2. Baixando o Projeto na Nova Máquina

1. Abra o Prompt de Comando (CMD) ou Git Bash na pasta onde quer salvar o projeto (ex: `C:\Projetos`).
2. Clone o repositório utilizando o Git:
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO_GIT>
   ```
3. Acesse a pasta do projeto:
   ```bash
   cd Liblink
   ```

---

## ⚡ 3. Rodando em Segundo Plano (Modo Silencioso)

Para que o usuário final da biblioteca não precise lidar com códigos ou telas pretas abertas, o Liblink possui **scripts automatizados inteligentes**:

### A) Iniciar o Sistema (Oculto)
1. Certifique-se de que o **Laragon** está aberto e com o botão **"Start All"** ativado.
2. Certifique-se de ter criado um banco de dados vazio chamado **`liblink`** no gerenciador de banco de dados do Laragon (HeidiSQL).
3. Vá até a pasta raiz do projeto clonado (`Liblink`) e **dê dois cliques no arquivo `iniciar.bat`**.
4. **O que acontece depois disso?**
   - Na primeira execução, ele instalará as dependências automaticamente e perguntará se você deseja criar as tabelas. Digite **`s`** e dê **Enter**.
   - Os servidores iniciarão **totalmente em segundo plano (ocultos)**. Nenhuma janela preta ficará aberta ou atrapalhará a barra de tarefas do Windows.
   - O seu navegador abrirá sozinho direto na tela de login do Liblink!
   - A janela do instalador se fechará sozinha.

### B) Parar o Sistema
Quando terminar o dia e quiser encerrar os servidores que estão rodando ocultos no computador:
1. Vá até a pasta raiz do projeto.
2. **Dê dois cliques no arquivo `parar.bat`**.
3. Ele encerrará instantaneamente os processos do PHP (Laravel) e Node.js (Vite) de forma limpa e segura!

---

## 🔧 4. Facilitando para o Usuário no Dia a Dia

Para tornar o uso simples para qualquer pessoa na escola:

1. **Atalho na Área de Trabalho:**
   - Na pasta do projeto, clique com o botão direito no arquivo **`iniciar.bat`**.
   - Selecione **Enviar para ➔ Área de trabalho (criar atalho)**.
   - Vá para a Área de Trabalho, renomeie o atalho para **"Liblink"** e altere o ícone dele nas Propriedades para um ícone bonito de livro ou pasta.

2. **Laragon no boot do Windows:**
   - Abra o Laragon, clique no ícone de engrenagem no canto superior direito.
   - Marque a caixinha **"Iniciar com o Windows" (Run Laragon when Windows starts)** e **"Iniciar tudo automaticamente" (Auto-start services)**.
   - Assim, o banco de dados MySQL sempre estará pronto e rodando quietinho sem ninguém precisar abrir painel ou digitar comandos!
