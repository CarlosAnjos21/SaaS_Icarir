const express = require('express');
const taskController = require('../controllers/taskController');
const checkAdmin = require('../middlewares/adminMiddleware');

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

module.exports = router;