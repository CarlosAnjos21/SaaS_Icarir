const express = require('express');
const taskController = require('../controllers/taskController');
const checkAdmin = require('../middlewares/adminMiddleware');

// Multer para upload de arquivos
const multer = require('multer');
// Middleware de autenticação
const authMiddleware = require('../middlewares/authMiddleware');

// Configuração do Multer para armazenar arquivos de evidências
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/evidences'); // já criou essa pasta
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB


// IMPORTANTE: { mergeParams: true }
// Isso permite que este router acesse os parâmetros da rota pai (o :missionId)
const router = express.Router({ mergeParams: true });

/**
 * @route   GET /api/missions/:missionId/tasks
 * @desc    Listar todas as tarefas ativas de uma missão
 */
router.get('/', taskController.getTasksByMissionId);

/**
 * @route   POST /api/missions/:missionId/tasks
 * @desc    (Admin) Criar uma nova tarefa para uma missão
 */
// Usamos o checkAdmin aqui!
router.post('/', checkAdmin, taskController.createTaskForMission);

/**
 * @route   GET /api/missions/:missionId/tasks/:taskId
 * @desc    (Usuário) Buscar uma tarefa específica pelo ID
 */
router.get('/:taskId', taskController.getTaskById);

/**
 * @route   POST /api/missions/:missionId/tasks/:taskId/submit
 * @desc    (Usuário) Submeter uma tarefa para validação
 */
router.post('/:taskId/submit', taskController.submitTask);

<<<<<<< HEAD

/**
 * @route   POST /api/missions/:missionId/tasks/:taskId/evidences
 * @desc    (Usuário) Upload de evidências (arquivos) para uma tarefa
 * @access  Private (bearer token)
 */
router.post('/:taskId/evidences', authMiddleware, upload.array('files', 5), taskController.uploadEvidence);

module.exports = router;
=======
module.exports = router;

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
 *     summary: Listar todas as tarefas ativas de uma missão
 *     tags: [Tarefas]
 *     parameters:
 *       - in: path
 *         name: missionId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da missão
 *     responses:
 *       200:
 *         description: Lista de tarefas retornada com sucesso
 *       400:
 *         description: ID inválido
 *       500:
 *         description: Erro interno
 */

/**
 * @swagger
 * /missions/{missionId}/tasks/{taskId}:
 *   get:
 *     summary: Buscar uma tarefa específica pelo ID
 *     tags: [Tarefas]
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
 *         description: Tarefa encontrada com sucesso
 *       400:
 *         description: IDs inválidos
 *       404:
 *         description: Tarefa não encontrada
 *       500:
 *         description: Erro interno
 */

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
 *             required:
 *               - evidencias
 *             properties:
 *               evidencias:
 *                 type: string
 *                 example: "URL da foto, vídeo ou texto enviado pelo usuário"
 *     responses:
 *       201:
 *         description: Tarefa submetida com sucesso
 *       400:
 *         description: Dados inválidos ou campos obrigatórios ausentes
 *       403:
 *         description: Usuário não inscrito na missão ou tarefa não pertence à missão
 *       409:
 *         description: Tarefa já concluída anteriormente
 *       500:
 *         description: Erro interno
 */

/**
 * @swagger
 * /missions/{missionId}/tasks:
 *   post:
 *     summary: (Admin) Criar uma nova tarefa para uma missão
 *     tags: [Admin - Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da missão à qual a tarefa pertence
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - pontos
 *               - tipo
 *               - dificuldade
 *             properties:
 *               categoria_id:
 *                 type: integer
 *                 nullable: true
 *               titulo:
 *                 type: string
 *                 example: "Tarefa Nubank"
 *               descricao:
 *                 type: string
 *                 nullable: true
 *                 example: "Descrição da tarefa Nubank"
 *               instrucoes:
 *                 type: string
 *                 nullable: true
 *                 example: "Instruções para  a tarefa Nubank"
 *               pontos:
 *                 type: integer
 *                 example: 10
 *               tipo:
 *                 type: string
 *                 example: "conhecimento"
 *               dificuldade:
 *                 type: string
 *                 example: "medio"
 *               ordem:
 *                 type: integer
 *                 nullable: true
 *               requisitos:
 *                 type: object
 *                 nullable: true
 *               tarefa_anterior_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *       400:
 *         description: Campos obrigatórios faltando
 *       404:
 *         description: Missão ou categoria não encontrada
 *       401:
 *         description: Token inválido ou sem permissão
 *       500:
 *         description: Erro interno
 */

>>>>>>> davi-dev
