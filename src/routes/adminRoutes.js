const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const adminMissionRoutes = require('./adminMissionRoutes');
const adminAwardsRoutes = require('./adminAwardsRoutes');
const adminQuizRoutes = require('./adminQuizRoutes');
const adminCardsRoutes = require('./adminCardsRoutes');
const adminUserRoutes = require('./adminUserRoutes');

// APLICAÇÃO EM CASCATA DE MIDDLEWARE:
// 1. Primeiro, verifica se o usuário está logado (authMiddleware).
// 2. Segundo, verifica se o usuário logado é 'admin' (adminMiddleware).
router.use(authMiddleware);
router.use(adminMiddleware);

// --- NOVO ENDPOINT DE DASHBOARD ---
/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    (Admin) Obter estatísticas gerais
 * @access  Admin
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

// --- ROTAS DE ADMINISTRAÇÃO ---
/**
 * @route   POST /api/admin/submissions/:submissionId/validate
 * @desc    (Admin) Validar (aprovar ou reprovar) uma submissão de tarefa
 * @access  Admin
 */
router.post(
  '/submissions/:submissionId/validate',
  adminController.validateTaskSubmission
);

// --- PLUGAR AS NOVAS ROTAS DE CRUD DE MISSÃO ---
// Todas as rotas em 'adminMissionRoutes' começarão com /api/admin/missions
router.use('/missions', adminMissionRoutes);

router.use('/users', adminUserRoutes);

// --- ROTAS DE CRUD DE QUIZ ---
// (Prefix: /api/admin/quizzes)
router.use('/quizzes', adminQuizRoutes);

// Todas as rotas em 'adminAwardsRoutes' começarão com /api/admin/awards
router.use('/awards', adminAwardsRoutes);

router.use('/cards', adminCardsRoutes);

module.exports = router;