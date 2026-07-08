const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/taskController');
const { authenticate, checkRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

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
 *     summary: Submeter uma tarefa com evidências (inclui opção de upload de arquivos)
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
 *               evidencias:
 *                 type: string
 *                 description: JSON string com evidências (links, respostas de quiz, etc)
 *                 example: '{"type":"quiz","answers":{"1":"opcaoA"}}'
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Até 10 arquivos de evidência (imagem ou PDF)
 *     responses:
 *       201:
 *         description: Tarefa submetida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 submission:
 *                   type: object
 *       400:
 *         description: Dados inválidos ou arquivo muito grande
 *       403:
 *         description: Usuário não inscrito na missão ou tarefa inativa
 *       409:
 *         description: Tarefa já concluída
 */
router.post(
  '/:taskId/submit',
  upload.array('files', 10), 
  taskController.submitTask   
);

/**
 * @swagger
 * /missions/{missionId}/tasks/{taskId}/evidences:
 *   post:
 *     summary: (DEPRECADO) Upload de evidências separado - use /submit ao invés
 *     tags: [Tarefas]
 *     deprecated: true
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
 *             required: [files]
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Evidências enviadas com sucesso
 *       400:
 *         description: Nenhum arquivo enviado ou formato inválido
 */
router.post(
  '/:taskId/evidences',
  upload.array('files', 10),
  taskController.uploadEvidence
);

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
 *               descricao:
 *                 type: string
 *               perguntas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [enunciado, resposta_correta]
 *                   properties:
 *                     enunciado:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                       enum: [multipla_escolha, verdadeiro_falso, texto]
 *                     opcoes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     resposta_correta:
 *                       type: string
 *                     explicacao:
 *                       type: string
 *     responses:
 *       201:
 *         description: Quiz criado com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       409:
 *         description: Tarefa já possui um quiz
 */
router.post(
  '/:taskId/quiz',
  checkRole(['admin']),
  taskController.createQuizForTask
);

module.exports = router;
