const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const authMiddleware = require('../middlewares/authMiddleware');
const taskRoutes = require('./taskRoutes');

// 1. Importar as rotas de tarefas
const taskRoutes = require('./taskRoutes');

// Aplica o middleware de autenticação a TODAS as rotas de missão e sub-rotas
router.use(authMiddleware);

// 2. Aninhar as rotas de tarefas
// Qualquer requisição para /api/missions/:missionId/tasks
// será redirecionada para o 'taskRoutes'
router.use('/:missionId/tasks', taskRoutes);

/**
 * @route   GET /api/missions
 * @desc    Listar todas as missões ativas
 */
router.get('/', missionController.getAllActiveMissions);

/**
 * @route   GET /api/missions/:missionId
 * @desc    Buscar detalhes de uma missão específica
 */
router.get('/:missionId', missionController.getMissionById);

/**
 * @route   POST /api/missions/:missionId/join
 * @desc    Inscrever o usuário logado em uma missão
 * @access  Privado
 */
router.post('/:missionId/join', missionController.joinMission); // <<< ADICIONADO

module.exports = router;