## 1. Visão Geral do Projeto

O **Liblink** é uma plataforma web desenvolvida para revolucionar a gestão de bibliotecas no ambiente escolar. Tendo como estudo de caso e principal beneficiário o **Centro de Ensino Fundamental 10 (CEF 10) do Gama-DF**, o projeto visa substituir controles manuais por um sistema automatizado, resiliente e de alta usabilidade.

A plataforma está alinhada ao **ODS 4 (Educação de Qualidade)** da ONU, atuando como um facilitador pedagógico. Ao transferir tarefas repetitivas (como a catalogação e o registro de empréstimos) para um sistema inteligente, o software devolve tempo útil aos servidores da escola, permitindo que foquem no incentivo à leitura e no atendimento aos alunos.

---

## 2. Arquitetura e Stack Tecnológico

O sistema foi desenhado com uma arquitetura separada (Client-Server), garantindo que a interface seja leve e responsiva, enquanto o servidor lida com a segurança e a persistência dos dados.

- **Front-end (Interface do Usuário):** Desenvolvido com **HTML5, CSS3 e JavaScript (Vanilla)**. O foco é uma interface limpa, orientada por padrões de UX/UI projetados no **Figma**, garantindo acessibilidade e baixa curva de aprendizado para professores e bibliotecários.
    
- **Back-end (Lógica de Negócios e API):** Estruturado em **PHP** (com a adoção do ecossistema **Laravel** atuando estritamente como uma API REST). Esta escolha garante roteamento seguro, proteção contra injeções SQL, controle de middlewares para autenticação e escopos globais para isolamento de dados (_Multi-tenant_).
    
- **Banco de Dados:** **MySQL**. Estruturado de forma relacional para garantir a integridade entre o cadastro de instituições, usuários (gestores/bibliotecários), acervo e histórico transacional de empréstimos e devoluções.
    
- **Integrações Externas:** Consumo de APIs governamentais (MEC/INEP) para validação de instituições e APIs de catalogação internacional (ISBN) para preenchimento automático de dados literários.
    

---

## 3. Metodologia e Ferramentas de Gestão

O fluxo de trabalho da equipe é regido por metodologias ágeis, garantindo entregas contínuas e adaptação a novos requisitos.

- **Metodologia Ágil:** Uso do **Scrum**, organizando o desenvolvimento em _sprints_ (ciclos curtos e iterativos) para a construção incremental do produto.
    
- **Controle de Versão:** **Git** para versionamento distribuído, utilizando ramificações (_branches_ como `devtest` e `main`) para evitar conflitos de código.
    
- **Repositório e Task Tracking:** **GitHub** atuando como repositório remoto em conjunto com a ferramenta **Kanban** integrada para gestão visual do fluxo de trabalho e acompanhamento de _status_ das tarefas.
    
- **Comunicação:** Alinhamento estratégico diário da equipe de desenvolvimento via WhatsApp.
    

---

## 4. Estrutura de Modelagem (UML)

A engenharia de requisitos do Liblink foi rigorosamente documentada utilizando a Linguagem de Modelagem Unificada (UML), cobrindo as seguintes frentes:

- **Diagrama de Casos de Uso:** Mapeamento das fronteiras do sistema e das permissões de interação para os atores "Visitante", "Gestor" e "Bibliotecário".
    
- **Diagrama de Classes:** Estrutura estática do banco de dados e orientação a objetos (Entidades: Escola, Usuário, Livro, Empréstimo).
    
- **Diagrama de Sequência:** Mapeamento temporal de processos críticos, como a comunicação do sistema com a API do INEP durante o cadastro.
    
- **Diagrama de Atividades:** Representação do fluxo condicional de rotinas operacionais (ex: verificação de inadimplência no ato do empréstimo).
    

---

## 5. Mapeamento de Funcionalidades (Casos de Uso Principais)

A plataforma possui seu núcleo operacional dividido em fluxos de acesso, gestão e operação:

- **UC-00 (Descoberta):** Navegação pela Landing Page para entendimento da proposta de valor.
    
- **UC-01 (Cadastro Institucional):** Onboarding de novas escolas. Inclui validação federada onde o sistema consome a API do INEP para certificar a autenticidade dos 8 dígitos informados, impedindo fraudes e duplicidades de _tenants_.
    
- **UC-02 (Autenticação Inteligente):** Login centralizado que realiza uma análise do identificador (INEP para Gestores, CPF para Bibliotecários). O sistema aplica um _Role Check_ e executa o redirecionamento dinâmico para o Dashboard correspondente.
    
- **UC-03 (Segurança):** Fluxo robusto de recuperação de senha via geração de _tokens_ temporários enviados por e-mail, protegido contra ataques de enumeração.
    
- **UC-04 (Gestão de Equipe):** Painel exclusivo do Administrador para cadastro, edição e inativação (bloqueio) de bibliotecários, mantendo a integridade do histórico de auditoria (sem exclusão física de registros).
    

---

## 6. Diferenciais e Soluções Técnicas

- **Isolamento Multi-tenant:** A arquitetura garante que os dados da "Escola A" sejam absolutamente invisíveis e inacessíveis pela "Escola B", proporcionando segurança total e adequação à LGPD.
    
- **Resiliência e Performance:** Projetado considerando a infraestrutura por vezes instável das escolas públicas. A separação entre Front-end leve e API otimiza o carregamento das páginas.
    
- **Automação de Acervo:** A funcionalidade de "Busca por ISBN" elimina o retrabalho manual, mitigando erros de digitação e padronizando o catálogo literário da instituição em segundos.