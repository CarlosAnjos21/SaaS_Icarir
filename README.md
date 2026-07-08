<div align="center">

# ICARIR

## Gamified Experience Platform

**Uma plataforma Full Stack para transformar jornadas de imersão, intercâmbio e capacitação em experiências digitais gamificadas.**

<br>

<img src="https://img.shields.io/badge/Status-Development-00C853?style=for-the-badge">
<img src="https://img.shields.io/badge/Architecture-Full%20Stack-2962FF?style=for-the-badge">
<img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge">
<img src="https://img.shields.io/badge/License-MIT-7CB342?style=for-the-badge">

<br><br>

**Live Demo:** https://icarir.vercel.app

</div>

---

# Overview

O **ICARIR** é uma plataforma desenvolvida para aumentar o engajamento em programas de imersão e experiências colaborativas através de gamificação.

A aplicação transforma atividades tradicionais em uma jornada interativa composta por:

* Missões estruturadas;
* Sistema de pontuação;
* Ranking competitivo;
* Perfis personalizados;
* Recompensas digitais;
* Networking entre participantes.

A proposta é criar uma experiência contínua antes, durante e depois de uma jornada presencial.

---

# Problem

Programas de intercâmbio e capacitação normalmente enfrentam desafios como:

* Baixo engajamento no período pré-evento;
* Falta de conexão entre participantes;
* Processos manuais de acompanhamento;
* Dificuldade em medir evolução individual;
* Pouca motivação para conclusão das atividades.

---

# Solution

O ICARIR centraliza toda a experiência em uma única plataforma.

Participantes podem:

* Executar missões;
* Acumular pontos;
* Evoluir no ranking;
* Construir perfil profissional;
* Desbloquear recompensas;
* Interagir com outros participantes.

Organizadores possuem ferramentas para:

* Criar missões;
* Gerenciar participantes;
* Validar atividades;
* Acompanhar métricas;
* Administrar recompensas.

---

# Main Features

## Participant Experience

| Feature             | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| Mission System      | Atividades categorizadas com objetivos, dificuldade e pontuação |
| Gamification        | Sistema de pontos, ranking e progressão                         |
| Interactive Profile | Perfil com informações profissionais e interesses               |
| Digital Collection  | Cards colecionáveis com raridade e desbloqueios                 |
| Quizzes             | Avaliações vinculadas às missões                                |
| Dashboard           | Acompanhamento individual de progresso                          |
| Evidence Submission | Envio de evidências para validação                              |

---

## Administration Platform

| Feature            | Description                                   |
| ------------------ | --------------------------------------------- |
| Mission Management | Criação e gerenciamento de jornadas           |
| Task Management    | Controle completo de atividades               |
| User Management    | Controle de usuários e permissões             |
| Validation System  | Aprovação de tarefas realizadas               |
| Reward Management  | Configuração de premiações                    |
| Audit Logs         | Histórico completo de alterações de pontuação |

---

# Engineering Highlights

O projeto aplica conceitos utilizados em aplicações reais:

```
✓ REST API architecture

✓ Separation of frontend and backend

✓ JWT authentication

✓ Role-Based Access Control (RBAC)

✓ Relational database modeling

✓ ORM with Prisma

✓ API documentation with Swagger

✓ Cloud deployment

✓ Secure protected routes

✓ Audit trail for business operations
```

---

# Technical Decisions

## PostgreSQL + Prisma ORM

Escolhidos para lidar com a complexidade dos relacionamentos entre:

* Usuários;
* Missões;
* Tarefas;
* Pontuação;
* Recompensas;
* Quizzes.

O Prisma facilita migrations, manutenção e consistência do modelo de dados.

---

## JWT Authentication

Utilizado para autenticação stateless entre frontend e backend.

A aplicação possui controle de acesso baseado em permissões:

```
Participant
Admin
Validator
```

---

## REST API

A comunicação entre frontend e backend segue uma arquitetura baseada em recursos:

```
Frontend
   |
   |
REST API
   |
   |
Backend Services
   |
   |
PostgreSQL Database
```

---

# Technology Stack

## Backend

```
Node.js
Express.js
PostgreSQL
Prisma ORM
JWT
Swagger
Supabase
```

## Frontend

```
React
Vite
Tailwind CSS
React Router
Framer Motion
Lucide Icons
```

## Infrastructure

```
Docker
Vercel
Railway
Git
```

---

# Architecture

```
ICARIR

├── Frontend
│
│   ├── React
│   ├── Components
│   ├── Pages
│   ├── Services
│   └── API Integration
│
├── Backend
│
│   ├── Routes
│   ├── Controllers
│   ├── Middlewares
│   ├── Authentication
│   └── Business Logic
│
└── Database
│
    ├── PostgreSQL
    ├── Prisma Schema
    └── Relational Models
```

---

# Database Model

Principais entidades:

```
Users
Profiles
Missions
Tasks
Enrollments
Points
Cards
Quizzes
Rewards
Audit Logs
```

O modelo foi projetado considerando escalabilidade e evolução futura da plataforma.

---

# Running Locally

## Requirements

* Node.js 20+
* PostgreSQL
* Docker
* Git

## Clone

```bash
git clone https://github.com/carlosotacilio/icarir.git

cd icarir
```

## Backend

```bash
cd backend

npm install

npx prisma migrate dev

npm run dev
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Environment Variables

Backend:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
NODE_ENV=
```

Frontend:

```env
VITE_API_URL=
```

---

# Roadmap

## Future Improvements

* Mobile application with React Native;
* Push notifications;
* Advanced analytics;
* WhatsApp integration;
* Offline support;
* Internationalization.

---

# Developer

## Carlos Otacílio

**Full Stack Developer**

Desenvolvendo aplicações modernas com foco em:

* Arquitetura de software;
* Experiência do usuário;
* APIs escaláveis;
* Soluções orientadas a produto.

<br>

GitHub:
https://github.com/carlosotacilio

LinkedIn:
https://linkedin.com/in/carlosotacilio

---

<div align="center">

**ICARIR — Every journey starts with a mission.**

</div>
