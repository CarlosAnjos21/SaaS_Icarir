const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/taskController');
const { authenticate, checkRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Auth já aplicado no missionRoutes pai via router.use

/**
 * @swagger
 * tags:
 *   name: Tarefas
 *   description: Endpoints relacionados às tarefas das missões
 */

/**
 * @swagger
 * /missions/{missionId}/tasks:
 *   get:
 *     summary: Lista todas as tarefas ativas de uma missão
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de tarefas retornada com sucesso
 *       400:
 *         description: ID inválido
 *   post:
 *     summary: (Admin) Criar uma nova tarefa para uma missão
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, pontos, tipo, dificuldade]
 *             properties:
 *               titulo:
 *                 type: string
 *               pontos:
 *                 type: integer
 *               tipo:
 *                 type: string
 *                 enum: [administrativa, conhecimento, engajamento, social, feedback]
 *               dificuldade:
 *                 type: string
 *                 enum: [facil, medio, dificil]
 *               categoria_id:
 *                 type: integer
 *               descricao:
 *                 type: string
 *               instrucoes:
 *                 type: string
 *               ordem:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *       400:
 *         description: Campos obrigatórios faltando
 *       404:
 *         description: Missão não encontrada
 */
router.route('/')
  .get(taskController.getTasksByMissionId)
  .post(checkRole(['admin']), taskController.createTaskForMission);

/**
 * @swagger
 * /missions/{missionId}/tasks/{taskId}:
 *   get:
 *     summary: Busca uma tarefa específica pelo ID
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tarefa encontrada
 *       404:
 *         description: Tarefa não encontrada
 *   put:
 *     summary: (Admin) Atualiza uma tarefa existente
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *       404:
 *         description: Tarefa não encontrada
 */
router.route('/:taskId')
  .get(taskController.getTaskById)
  .put(checkRole(['admin']), taskController.updateTask);

/**
 * @swagger
 * /missions/{missionId}/tasks/{taskId}/submit:
 *   post:
 *     summary: Submeter uma tarefa para validação
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [evidencias]
 *             properties:
 *               evidencias:
 *                 type: object
 *                 example: { type: "link", url: "https://..." }
 *     responses:
 *       201:
 *         description: Tarefa submetida com sucesso
 *       403:
 *         description: Usuário não inscrito na missão
 *       409:
 *         description: Tarefa já concluída
 */
router.post('/:taskId/submit', taskController.submitTask);

/**
 * @swagger
 * /missions/{missionId}/tasks/{taskId}/evidences:
 *   post:
 *     summary: Upload de evidências (imagem) para uma tarefa
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Evidências enviadas com sucesso
 *       400:
 *         description: Nenhum arquivo enviado
 */
router.post('/:taskId/evidences', upload.array('file', 5), taskController.uploadEvidence);

/**
 * @swagger
 * /missions/{missionId}/tasks/{taskId}/quiz:
 *   post:
 *     summary: (Admin) Criar um quiz para uma tarefa
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, perguntas]
 *             properties:
 *               titulo:
 *                 type: string
 *               perguntas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     enunciado:
 *                       type: string
 *                     opcoes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     resposta_correta:
 *                       type: string
 *     responses:
 *       201:
 *         description: Quiz criado com sucesso
 *       409:
 *         description: Tarefa já possui um quiz
 */
router.post('/:taskId/quiz', checkRole(['admin']), taskController.createQuizForTask);

module.exports = router;