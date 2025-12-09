// src/api/apiFunctions.js

import api from './api'; // Importa a instância configurada

const CARDS_BASE_URL = '/admin/cards';
const TASKS_ADMIN_BASE_URL = '/admin/tasks'; // Usado para operações CRUD e select simplificado
const QUIZZES_ADMIN_BASE_URL = '/admin/quizzes';

// --- ESTATÍSTICAS (Dashboard) ---
export const fetchStats = async () => {
    // Corrigido para o endpoint administrativo
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
};

// --- MISSÕES (CRUD) ---
export const fetchMissions = async () => {
    try {
        // Buscar do endpoint admin para obter todas as missões com todos os campos (incluindo vagas_disponiveis)
        const response = await api.get("/admin/missions");
        return response.data;
    } catch (error) {
        // É importante tratar o erro aqui para que o frontend não quebre
        console.error("Erro ao carregar missões:", error);
        throw error;
    }
};

export const createMission = async (missionData) => {
    const response = await api.post("/admin/missions", missionData);
    // backend retorna { message, mission }
    return response.data.mission || response.data;
};

export const updateMission = async (id, missionData) => {
    const response = await api.put(`/admin/missions/${id}`, missionData);
    // backend retorna { message, mission }
    return response.data.mission || response.data;
};

export const deleteMissionApi = async (id) => {
    const response = await api.delete(`/admin/missions/${id}`);
    return response.data;
};

// --- USUÁRIOS (CRUD) ---
export const fetchUsers = async () => {
    // Presumindo que o endpoint é: /admin/users
    const response = await api.get("/admin/users");
    return response.data;
};

export const createUser = async (userData) => {
    const response = await api.post("/admin/users", userData);
    return response.data;
};

export const updateUser = async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
};

export const deleteUserApi = async (id) => {
    await api.delete(`/admin/users/${id}`);
};

// --- CATEGORIAS DE TAREFAS (CRUD) ---
export const fetchCategories = async () => {
    // Endpoint: /categorias-tarefas (mountado em /api)
    const response = await api.get("/categorias-tarefas");
    // backend retorna array de categorias
    return response.data;
};

export const createCategory = async (categoryData) => {
    const response = await api.post("/categorias-tarefas", categoryData);
    // backend retorna { message, categoria }
    return response.data.categoria || response.data;
};

export const updateCategory = async (id, categoryData) => {
    const response = await api.put(`/categorias-tarefas/${id}`, categoryData);
    // backend retorna { message, categoria }
    return response.data.categoria || response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/categorias-tarefas/${id}`);
    return response.data;
};


// --- TAREFAS (CRUD) ---
export const fetchTasks = async () => {
    // Endpoint para listar todas as tarefas no painel admin
    const response = await api.get(TASKS_ADMIN_BASE_URL);
    return response.data;
};

export const createTask = async (taskData) => {
    // Normalize requisitos: ensure JSON serializable
    const payload = { ...taskData };
    if (payload.requisitos !== undefined && payload.requisitos !== null) {
        if (typeof payload.requisitos === 'string') {
            try {
                payload.requisitos = JSON.parse(payload.requisitos);
            } catch (e) {
                payload.requisitos = payload.requisitos.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
    } else {
        payload.requisitos = null;
    }

    const response = await api.post(TASKS_ADMIN_BASE_URL, payload);
    // adminTaskController retorna { message, task }
    return response.data.task || response.data;
};

export const updateTask = async (id, taskData) => {
    const payload = { ...taskData };
    if (payload.requisitos !== undefined && payload.requisitos !== null) {
        if (typeof payload.requisitos === 'string') {
            try {
                payload.requisitos = JSON.parse(payload.requisitos);
            } catch (e) {
                payload.requisitos = payload.requisitos.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
    } else {
        payload.requisitos = null;
    }

    const response = await api.put(`${TASKS_ADMIN_BASE_URL}/${id}`, payload);
    // adminTaskController retorna { message, task }
    return response.data.task || response.data;
};

export const deleteTask = async (id) => {
    await api.delete(`${TASKS_ADMIN_BASE_URL}/${id}`);
};

// --- CARDS/SELOS (CRUD) --- <--- ADICIONADO
export const fetchCards = async () => {
    // Endpoint: /api/admin/cards (GET)
    const response = await api.get(CARDS_BASE_URL);
    return response.data;
};

export const createCard = async (cardData) => {
    // Endpoint: /api/admin/cards (POST)
    const response = await api.post(CARDS_BASE_URL, cardData);
    return response.data;
};

export const updateCard = async (id, cardData) => {
    // Endpoint: /api/admin/cards/:id (PUT)
    const response = await api.put(`${CARDS_BASE_URL}/${id}`, cardData);
    return response.data;
};

export const deleteCard = async (id) => {
    // Endpoint: /api/admin/cards/:id (DELETE - Soft Delete)
    await api.delete(`${CARDS_BASE_URL}/${id}`);
};

// --- QUIZZES (CRUD SIMPLIFICADO) ---
export const fetchQuizzes = async () => {
    const response = await api.get(QUIZZES_ADMIN_BASE_URL);
    return response.data;
};

export const createQuizApi = async (quizData) => {
    const response = await api.post(QUIZZES_ADMIN_BASE_URL, quizData);
    // controller retorna { message, quiz }
    return response.data.quiz || response.data;
};

export const createQuizQuestion = async (quizId, questionData) => {
    const response = await api.post(`${QUIZZES_ADMIN_BASE_URL}/${quizId}/questions`, questionData);
    // controller retorna { message, pergunta }
    return response.data.pergunta || response.data;
};

export const updateQuizApi = async (quizId, quizData) => {
    const response = await api.put(`${QUIZZES_ADMIN_BASE_URL}/${quizId}`, quizData);
    return response.data.quiz || response.data;
};

export const deleteQuizApi = async (quizId) => {
    const response = await api.delete(`${QUIZZES_ADMIN_BASE_URL}/${quizId}`);
    return response.data;
};

export const updateQuizQuestion = async (quizId, questionId, questionData) => {
    const response = await api.put(`${QUIZZES_ADMIN_BASE_URL}/${quizId}/questions/${questionId}`, questionData);
    return response.data.pergunta || response.data;
};

export const deleteQuizQuestion = async (quizId, questionId) => {
    const response = await api.delete(`${QUIZZES_ADMIN_BASE_URL}/${quizId}/questions/${questionId}`);
    return response.data;
};


// --- FUNÇÕES AUXILIARES ---
export const fetchTasksForSelect = async () => {
    // Usa a lista padrão e retorna id/titulo para selects
    const response = await api.get(TASKS_ADMIN_BASE_URL);
    const tasks = response.data || [];
    return tasks.map(t => ({ id: t.id, titulo: t.titulo || t.descricao || `Tarefa ${t.id}` }));
};