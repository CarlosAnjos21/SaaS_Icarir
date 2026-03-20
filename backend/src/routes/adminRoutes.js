const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, checkRole } = require('../middlewares/authMiddleware');

const adminMissionRoutes = require('./adminMissionRoutes');
const adminQuizRoutes = require('./adminQuizRoutes');
const adminCardsRoutes = require('./adminCardsRoutes');
const adminUserRoutes = require('./adminUserRoutes');
const adminEnrollmentsRoutes = require('./adminEnrollmentsRoutes');
const adminTaskRoutes = require('./adminTaskRoutes');
const adminAwardsRoutes = require('./adminAwardsRoutes');

// Proteção global — todas as rotas abaixo exigem admin autenticado
router.use(authenticate);
router.use(checkRole(['admin']));

/**
 * @swagger
 * tags:
 *   name: Admin - Dashboard
 *   description: Estatísticas e validações administrativas
 */

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: Retorna estatísticas gerais do sistema
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

/**
 * @swagger
 * /admin/submissions/{submissionId}/validate:
 *   post:
 *     summary: Aprova ou reprova uma submissão de tarefa
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [approve]
 *             properties:
 *               approve:
 *                 type: boolean
 *               pontos_concedidos:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Submissão validada com sucesso
 *       404:
 *         description: Submissão não encontrada
 */
router.post('/submissions/:submissionId/validate', adminController.validateTaskSubmission);

router.use('/missions', adminMissionRoutes);
router.use('/quizzes', adminQuizRoutes);
router.use('/cards', adminCardsRoutes);
router.use('/users', adminUserRoutes);
router.use('/enrollments', adminEnrollmentsRoutes);
router.use('/tasks', adminTaskRoutes);
router.use('/awards', adminAwardsRoutes);

module.exports = router;