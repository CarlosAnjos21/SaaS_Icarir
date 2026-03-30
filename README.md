<div align="center">

<br/>

```
██╗ ██████╗ █████╗ ██████╗ ██╗██████╗
██║██╔════╝██╔══██╗██╔══██╗██║██╔══██╗
██║██║     ███████║██████╔╝██║██████╔╝
██║██║     ██╔══██║██╔══██╗██║██╔══██╗
██║╚██████╗██║  ██║██║  ██║██║██║  ██║
╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
```

**Plataforma Gamificada de Missões e Networking**

*Transformando jornadas em experiências inesquecíveis*

<br/>

[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange?style=flat-square)
[![MVP](https://img.shields.io/badge/MVP-8--14%20semanas-blue?style=flat-square)
[![Licença](https://img.shields.io/badge/Licença-MIT-green?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-bem--vindos-brightgreen?style=flat-square)](./CONTRIBUTING.md)

<br/>

[🚀 Demo ao Vivo](https://icarir.vercel.app) · [📖 Documentação](./docs) · [🐛 Reportar Bug](../../issues) · [💡 Sugerir Feature](../../issues)

</div>

---

## 📌 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura](#-arquitetura-do-projeto)
- [Banco de Dados](#-modelagem-do-banco-de-dados)
- [Como Rodar](#-como-rodar-localmente)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [API Reference](#-api-reference)
- [Roadmap](#-roadmap-de-desenvolvimento)
- [Contribuição](#-contribuindo)
- [Contato](#-contato)

---

## 🎯 Sobre o Projeto

O **ICARIR** nasceu de uma necessidade real: **tornar as missões de imersão e intercâmbio mais engajantes antes, durante e depois da viagem**. Em vez de formulários e tarefas burocráticas avulsas, o ICARIR transforma cada etapa da jornada em uma **missão com propósito, recompensa e conexão humana**.

### O Problema
Programas de missões e intercâmbios enfrentam baixo engajamento na fase de pré-embarque, isolamento entre participantes que ainda não se conhecem, tarefas administrativas monótonas e sem incentivo, e dificuldade em medir o nível de preparação individual dos participantes.

### A Solução
Uma plataforma que gamifica toda a jornada do participante — unindo **missões temáticas**, **ranking competitivo**, **perfis interativos** e **networking real** em um único ambiente digital coeso.

### Diferenciais
- 🎮 **Gamificação real** — não é só um checklist com pontos; há narrativa, progressão e recompensas visuais
- 🤝 **Networking ativo** — o sistema incentiva a descoberta e interação entre participantes antes da viagem
- 🧩 **Álbum de figurinhas digitais** — colecionáveis que representam empresas, destinos e colegas de missão
- 📊 **Dados para coordenadores** — painel administrativo com visibilidade total do engajamento da turma

---

## ⚡ Funcionalidades

### Para Participantes

| Funcionalidade | Descrição | Status |
|---|---|---|
| 🗺️ **Missões Gamificadas** | 5 tipos de tarefa: administrativa, conhecimento, engajamento, social e feedback | ✅ Implementado |
| 🏅 **Sistema de Pontos Duplo** | `pontos` (saldo atual) e `pontos_totais` (histórico), com log auditável por tarefa | ✅ Implementado |
| 📊 **Ranking** | Classificação baseada em `pontos_totais` — inclui pódio visual | ✅ Implementado |
| 👤 **Perfil Interativo** | Bio, LinkedIn, website, interesses, data de nascimento e empresa | ✅ Implementado |
| 🃏 **Cards Colecionáveis** | 3 tipos (`empresa`, `destino`, `líder`) com raridade (`comum`, `raro`, `épico`) desbloqueados por tarefas | ✅ Implementado |
| 🧠 **Quiz por Tarefa** | Quizzes vinculados a tarefas com múltipla escolha, V/F e resposta aberta | ✅ Implementado |
| 📈 **Dashboard Pessoal** | Progresso individual: tarefas concluídas, pontos, posição no ranking | ✅ Implementado |
| ✅ **Fluxo de Validação** | Tarefas com evidências (JSON) são validadas por usuários com role `validador` | ✅ Implementado |
| 🏆 **Premiações** | Sistema de prêmios por posição no ranking ou pontos acumulados (consultoria, gadget, certificado) | ✅ Implementado |
| 💳 **Controle de Pagamento** | Inscrições em missões com status de pagamento (`pendente`, `pago`, `cancelado`, `reembolsado`) | ✅ Implementado |

### Para Administradores

| Funcionalidade | Descrição | Status |
|---|---|---|
| ⚙️ **Painel Administrativo** | Interface completa: missões, tarefas, usuários, quiz, cards e premiações | ✅ Implementado |
| 🗂️ **CRUD de Missões e Tarefas** | Criar tarefas com pontos, tipo, dificuldade, pré-requisitos (JSON) e ordem | ✅ Implementado |
| 👥 **Gerenciamento de Usuários** | 3 roles: `participante`, `admin` e `validador` com controle de acesso granular | ✅ Implementado |
| 📋 **Gestão de Inscrições** | Controle de status de participação e pagamento por missão | ✅ Implementado |
| 🃏 **Gestão de Cards e Premiações** | Criar e vincular cards a tarefas; atribuir prêmios por ranking ou pontos | ✅ Implementado |
| 📜 **Log de Pontos** | Auditoria completa: cada variação de pontos registra tarefa, missão e validador | ✅ Implementado |

---

## 🛠 Stack Tecnológica

### Backend

| Tecnologia | Função | Versão |
|---|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | Runtime JavaScript | 20.x LTS |
| ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) | Framework HTTP e roteamento | 4.x |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white) | Banco de dados relacional | 15.x |
| ![Prisma](https://img.shields.io/badge/Prisma-0C344B?style=flat-square&logo=prisma&logoColor=white) | ORM e migrações de banco | 5.x |
| ![JWT](https://img.shields.io/badge/JWT-323330?style=flat-square&logo=JSONWebTokens&logoColor=white) | Autenticação stateless | — |
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | Auth, storage e banco gerenciado | — |
| ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black) | Documentação interativa da API | — |

### Frontend

| Tecnologia | Função | Versão |
|---|---|---|
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) | Biblioteca de UI | 18.x |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Build tool e dev server | 5.x |
| ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white) | Framework de estilos utilitário | 3.x |
| ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat-square) | Animações e transições | 11.x |
| ![React Router](https://img.shields.io/badge/ReactRouter-CA4245?style=flat-square&logo=react-router&logoColor=white) | Roteamento SPA | 6.x |
| ![Lucide Icons](https://img.shields.io/badge/Lucide-000000?style=flat-square) | Biblioteca de ícones | — |

### DevOps & Infra

| Tecnologia | Uso |
|---|---|
| ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) | Deploy do frontend |
| ![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white) | Deploy do backend e banco |
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | Banco de dados e storage em produção |

---

## 🏗 Arquitetura do Projeto

```
umbrella_corporation/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 config/          # Clientes Prisma e Supabase
│   │   ├── 📁 controllers/     # Lógica por recurso (auth, missões, tarefas, quiz, admin...)
│   │   ├── 📁 middlewares/
│   │   │   ├── authMiddleware.js       # Verificação de JWT
│   │   │   ├── adminMiddleware.js      # Controle de acesso por role
│   │   │   └── uploadMiddleware.js     # Upload de arquivos (Multer)
│   │   ├── 📁 routes/
│   │   │   └── index.js               # Agregador de todas as rotas
│   │   ├── server.js                  # Entrada da aplicação
│   │   └── swagger.js                 # Documentação interativa da API
│   ├── 📁 prisma/
│   │   └── schema.prisma              # Modelos, enums e relações do banco
│   ├── 📁 uploads/                    # Evidências enviadas pelos participantes
│   └── 📄 package.json
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 api/
│   │   │   ├── api.js                 # Configuração base do cliente HTTP
│   │   │   └── apiFunctions.js        # Todas as chamadas à API
│   │   ├── 📁 components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx     # Guarda de rotas autenticadas
│   │   │   ├── Podium.jsx
│   │   │   └── ProgressBar.jsx
│   │   ├── 📁 pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Missions.jsx
│   │   │   ├── Ranking.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Quiz.jsx
│   │   │   └── Admin.jsx
│   │   ├── 📁 services/
│   │   │   └── authService.js         # Login, logout e gestão de token
│   │   └── App.jsx                    # Roteamento principal
│   ├── 📄 vite.config.js
│   └── 📄 package.json
```

---

## 🗄 Modelagem do Banco de Dados

### Enums

| Enum | Valores |
|---|---|
| `Role` | `participante` · `admin` · `validador` |
| `TipoTarefa` | `administrativa` · `conhecimento` · `engajamento` · `social` · `feedback` |
| `Dificuldade` | `facil` · `medio` · `dificil` |
| `StatusPagamento` | `pendente` · `pago` · `cancelado` · `reembolsado` |
| `StatusParticipacao` | `inscrito` · `confirmado` · `concluido` · `cancelado` |
| `TipoCard` | `empresa` · `destino` · `lider` |
| `Raridade` | `comum` · `raro` · `epico` |
| `TipoPremiacao` | `consultoria` · `gadget` · `certificado` · `outro` |
| `TipoPergunta` | `multipla_escolha` · `verdadeiro_falso` · `texto` |

### Diagrama de Entidades

```
┌──────────────────┐          ┌─────────────────────┐
│     usuarios     │          │   usuarios_missoes   │
├──────────────────┤    1:N   ├─────────────────────┤   N:1   ┌────────────────┐
│ id (PK)          │─────────>│ usuario_id (FK)      │<────────│     missoes    │
│ nome             │          │ missao_id (FK)        │         ├────────────────┤
│ email (UNIQUE)   │          │ status_pagamento      │         │ id (PK)        │
│ senha            │          │ status_participacao   │         │ titulo         │
│ empresa          │          │ valor_pago            │         │ destino        │
│ role             │          │ forma_pagamento       │         │ data_inicio    │
│ pontos           │          └─────────────────────┘         │ data_fim       │
│ pontos_totais    │                                            │ vagas          │
│ foto_url         │          ┌─────────────────────┐         │ ativa          │
│ ativo            │    1:N   │   usuarios_tarefas   │         └───────┬────────┘
└────────┬─────────┘─────────>├─────────────────────┤                 │ 1:N
         │                    │ usuario_id (FK)      │                 ▼
         │ 1:1                │ tarefa_id (FK)       │         ┌────────────────┐
         ▼                    │ concluida            │         │    tarefas     │
┌──────────────────┐          │ pontos_obtidos       │   N:1   ├────────────────┤
│      perfis      │          │ evidencias (JSON)    │<────────│ id (PK)        │
├──────────────────┤          │ tentativas           │         │ missao_id (FK) │
│ id (PK)          │          │ validado_por (FK)    │         │ categoria_id   │
│ usuario_id (FK)  │          │ data_validacao       │         │ titulo         │
│ curiosidades     │          └─────────────────────┘         │ pontos         │
│ linkedin_url     │                                            │ tipo           │
│ website          │          ┌─────────────────────┐         │ dificuldade    │
│ interesses       │    1:N   │   usuarios_cards     │         │ ordem          │
│ data_nascimento  │─────────>├─────────────────────┤         └───────┬────────┘
└──────────────────┘          │ usuario_id (FK)      │                 │ 1:1
                              │ card_id (FK)         │                 ▼
                              │ data_desbloqueio     │         ┌────────────────┐
                              └──────────┬──────────┘         │    quizzes     │
                                         │ N:1                ├────────────────┤
                                         ▼                    │ id (PK)        │
                              ┌──────────────────┐            │ tarefa_id (FK) │
                              │      cards       │            │ titulo         │
                              ├──────────────────┤            │ ativo          │
                              │ id (PK)          │            └───────┬────────┘
                              │ titulo           │                    │ 1:N
                              │ tipo (TipoCard)  │                    ▼
                              │ raridade         │            ┌────────────────┐
                              │ empresa_nome     │            │ perguntas_quiz │
                              │ pais / cidade    │            ├────────────────┤
                              │ tarefa_requerida │            │ id (PK)        │
                              └──────────────────┘            │ quiz_id (FK)   │
                                                              │ enunciado      │
┌──────────────────┐                                          │ tipo           │
│    premiacoes    │          ┌─────────────────────┐        │ opcoes (JSON)  │
├──────────────────┤    1:N   │ usuarios_premiacoes  │        │ resposta_corr. │
│ id (PK)          │<─────────├─────────────────────┤        └───────┬────────┘
│ titulo           │          │ usuario_id (FK)      │                │ 1:N
│ tipo             │          │ premiacao_id (FK)    │                ▼
│ posicao_ranking  │          │ entregue             │        ┌────────────────┐
│ pontos_necessari │          │ data_entrega         │        │respostas_quizz │
│ quantidade_disp  │          └─────────────────────┘        ├────────────────┤
└──────────────────┘                                          │ usuario_id (FK)│
                                                              │ pergunta_id FK │
┌──────────────────┐                                          │ resposta       │
│   logs_pontos    │                                          │ correta        │
├──────────────────┤                                          │ pontos_obtidos │
│ id (PK)          │  ← Auditoria completa de pontuação       └────────────────┘
│ usuario_id (FK)  │
│ tarefa_id (FK)   │  ┌───────────────────────┐
│ missao_id (FK)   │  │   categorias_tarefas  │
│ validador_id(FK) │  ├───────────────────────┤
│ pontos           │  │ id (PK)               │
│ tipo             │  │ nome                  │
│ descricao        │  │ icone / cor / ordem   │
└──────────────────┘  └───────────────────────┘
```

> Schema completo em [`/backend/prisma/schema.prisma`](./backend/prisma/schema.prisma)

---

## 💻 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) e Docker Compose
- [Git](https://git-scm.com/)

### 1. Clone o repositório

```bash
git clone https://github.com/carlosotacilio/icarir.git
cd icarir
```

### 2. Suba o banco de dados com Docker

```bash
docker-compose up -d
```

Isso inicializa um container PostgreSQL pronto para uso na porta `5432`.

### 3. Configure o Backend

```bash
cd backend
cp .env.example .env
# Edite o .env com suas configurações
npm install
npx prisma migrate dev   # Cria as tabelas
npx prisma db seed       # Popula dados iniciais (opcional)
npm run dev
```

API disponível em: `http://localhost:3333`

### 4. Configure o Frontend

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Aplicação disponível em: `http://localhost:5173`

### 5. (Opcional) Rodar tudo com Docker Compose

```bash
docker-compose --profile full up
```

---

## 🔐 Variáveis de Ambiente

### Backend — `.env`

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/icarir_db"

# Autenticação
JWT_SECRET="seu-segredo-aqui-use-openssl-rand-base64-32"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3333
NODE_ENV=development

# Upload de arquivos (opcional)
STORAGE_PROVIDER=local   # local | s3
AWS_BUCKET_NAME=
AWS_REGION=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
```

### Frontend — `.env`

```env
VITE_API_URL=http://localhost:3333/api
```

---

## 📡 API Reference

> Documentação interativa disponível via Swagger em `http://localhost:3333/api-docs` com o backend rodando.

### Autenticação

```
POST   /api/auth/register         → Cadastro de participante
POST   /api/auth/login            → Login (retorna JWT)
```

### Usuários e Perfis

```
GET    /api/usuarios/me           → Perfil do usuário autenticado
PUT    /api/usuarios/me           → Atualizar dados do perfil
GET    /api/usuarios/:id          → Perfil público de um participante
```

### Missões

```
GET    /api/missoes               → Listar missões disponíveis
GET    /api/missoes/:id           → Detalhes de uma missão
```

### Tarefas

```
GET    /api/tarefas               → Listar tarefas do usuário (por missão)
GET    /api/tarefas/:id           → Detalhes de uma tarefa
POST   /api/tarefas/:id/concluir  → Submeter conclusão de tarefa (com evidências)
GET    /api/categorias-tarefas    → Listar categorias de tarefas
```

### Ranking e Dashboard

```
GET    /api/ranking               → Ranking geral (pontos_totais)
GET    /api/dashboard             → Progresso pessoal e estatísticas
```

### Quiz

```
GET    /api/quiz/:tarefa_id       → Quiz vinculado a uma tarefa
POST   /api/quiz/:id/responder    → Responder pergunta do quiz
```

### Validador

```
GET    /api/validador/pendentes   → Tarefas aguardando validação
POST   /api/validador/:id/validar → Aprovar ou reprovar conclusão de tarefa
```

### Admin — Missões e Tarefas

```
POST   /api/admin/missoes         → Criar missão
PUT    /api/admin/missoes/:id     → Editar missão
DELETE /api/admin/missoes/:id     → Excluir missão
POST   /api/admin/tarefas         → Criar tarefa (com pontos, tipo, dificuldade)
PUT    /api/admin/tarefas/:id     → Editar tarefa
DELETE /api/admin/tarefas/:id     → Excluir tarefa
```

### Admin — Usuários e Inscrições

```
GET    /api/admin/usuarios        → Listar todos os usuários
PUT    /api/admin/usuarios/:id    → Editar usuário (role, pontos, status)
GET    /api/admin/inscricoes      → Listar inscrições em missões
PUT    /api/admin/inscricoes/:id  → Atualizar status de participação/pagamento
```

### Admin — Quiz, Cards e Premiações

```
POST   /api/admin/quiz            → Criar quiz para uma tarefa
POST   /api/admin/cards           → Criar card colecionável (empresa/destino/líder)
PUT    /api/admin/cards/:id       → Editar card
POST   /api/admin/premiacoes      → Criar premiação
GET    /api/admin/premiacoes      → Listar premiações e vencedores
```

> Todos os endpoints (exceto auth) exigem `Authorization: Bearer <token>`.  
> Rotas `/admin/*` exigem `role: "admin"` · Rotas `/validador/*` exigem `role: "validador"`.

---

## 🗓 Roadmap

### Backlog pós-MVP
- [ ] App mobile (React Native)
- [ ] Notificações push
- [ ] Integração com WhatsApp para lembretes
- [ ] Analytics avançado de engajamento
- [ ] Modo offline (PWA)
- [ ] Internacionalização (i18n)

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Para manter a qualidade do código, siga as etapas abaixo.

### Fluxo de Trabalho

```bash
# 1. Faça um fork do repositório
# 2. Crie uma branch para sua feature
git checkout -b feature/nome-da-feature

# 3. Faça commits semânticos
git commit -m "feat: adiciona sistema de notificações"
# Prefixos: feat | fix | docs | style | refactor | test | chore

# 4. Abra um Pull Request descrevendo a mudança
```

### Padrão de Commits

Seguimos o [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Atualização de documentação |
| `refactor:` | Refatoração sem mudança de comportamento |
| `test:` | Adição ou correção de testes |
| `chore:` | Configurações, dependências, CI |

---


## 📄 Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](./LICENSE) para mais informações.

---

## 📬 Contato

<div align="center">

**Carlos Otacílio**

Desenvolvedor Full Stack • Criador do ICARIR

[![Email](https://img.shields.io/badge/Email-carlosotacilio%40example.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:carlosotacilio@example.com)
[![GitHub](https://img.shields.io/badge/GitHub-carlosotacilio-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/carlosotacilio)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-carlosotacilio-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/carlosotacilio)

<br/>

*Desenvolvido com ❤️ e muito ☕ por Carlos Otacílio*

*"Toda grande jornada começa com uma missão."*

</div>