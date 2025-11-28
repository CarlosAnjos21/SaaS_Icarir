// src/api/apiFunctions.js

import api from './api'; // Importa a instância configurada

const CARDS_BASE_URL = '/admin/cards'; 
const TASKS_ADMIN_BASE_URL = '/admin/tasks'; // Usado para operações CRUD e select simplificado

// --- ESTATÍSTICAS (Dashboard) ---
export const fetchStats = async () => {
    // Corrigido para o endpoint administrativo
    const response = await api.get("/admin/dashboard/stats"); 
    return response.data;
};

// --- MISSÕES (CRUD) ---
export const fetchMissions = async () => {
    // Presumindo que o endpoint é: /admin/missions
    const response = await api.get("/admin/missions");
    return response.data;
};

export const createMission = async (missionData) => {
    const response = await api.post("/admin/missions", missionData);
    return response.data;
};

export const updateMission = async (id, missionData) => {
    const response = await api.put(`/admin/missions/${id}`, missionData);
    return response.data;
};

export const deleteMissionApi = async (id) => {
    await api.delete(`/admin/missions/${id}`);
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
    // Presumindo que o endpoint é: /admin/categorias-tarefas
    const response = await api.get("/admin/categorias-tarefas");
    return response.data;
};

export const createCategory = async (categoryData) => {
    const response = await api.post("/admin/categorias-tarefas", categoryData);
    return response.data;
};

export const updateCategory = async (id, categoryData) => {
    const response = await api.put(`/admin/categorias-tarefas/${id}`, categoryData);
    return response.data;
};

export const deleteCategory = async (id) => {
    await api.delete(`/admin/categorias-tarefas/${id}`);
};


// --- TAREFAS (CRUD) ---
export const fetchTasks = async () => {
    // Endpoint para listar todas as tarefas no painel admin
    const response = await api.get(TASKS_ADMIN_BASE_URL);
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await api.post(TASKS_ADMIN_BASE_URL, taskData);
    return response.data;
};

export const updateTask = async (id, taskData) => {
    const response = await api.put(`${TASKS_ADMIN_BASE_URL}/${id}`, taskData);
    return response.data;
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


// --- FUNÇÕES AUXILIARES ---
export const fetchTasksForSelect = async () => {
    // Endpoint para buscar lista simplificada de tarefas para SELECTs em modais
    const response = await api.get(`${TASKS_ADMIN_BASE_URL}/select`); 
    return response.data;
};