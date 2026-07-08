import api from './api';

/**
 * Submeter tarefa com evidências e arquivos
 * POST /api/missions/{missionId}/tasks/{taskId}/submit
 * 
 * @param {number} missionId - ID da missão
 * @param {number} taskId - ID da tarefa
 * @param {Object} evidencias - Dados de evidência (quiz respostas, links, etc)
 * @param {File[]} files - Arquivos para upload (opcional)
 * @returns {Promise} Resposta da API
 */
export const submitTaskWithEvidence = async (missionId, taskId, evidencias, files = []) => {
  const formData = new FormData();
  formData.append('evidencias', JSON.stringify(evidencias));

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post(
    `/missions/${missionId}/tasks/${taskId}/submit`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

export const uploadTaskEvidence = async (missionId, taskId, files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post(
    `/missions/${missionId}/tasks/${taskId}/evidences`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

export const getTask = async (missionId, taskId) => {
  const response = await api.get(`/missions/${missionId}/tasks/${taskId}`);
  return response.data;
};

export const getTasks = async (missionId) => {
  const response = await api.get(`/missions/${missionId}/tasks`);
  return response.data;
};