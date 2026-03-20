const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const { authenticate, checkRole } = require('../middlewares/authMiddleware');
const taskRoutes = require('./taskRoutes');

// Aninhar rotas de tarefas — authenticate aplicado aqui para todas as subrotas
router.use('/:missionId/tasks', authenticate, checkRole(['admin', 'participante']), taskRoutes);

/**
 * @swagger
 * tags:
 *   name: Missões
 *   description: Endpoints de missões para participantes
 */

/**
 * @swagger
 * /missions:
 *   get:
 *     summary: Lista todas as missões ativas
 *     tags: [Missões]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de missões retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/', authenticate, missionController.getAllActiveMissions);

/**
 * @swagger
 * /missions/{missionId}:
 *   get:
 *     summary: Busca detalhes básicos de uma missão
 *     tags: [Missões]
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
 *         description: Missão encontrada
 *       404:
 *         description: Missão não encontrada
 */
router.get('/:missionId', authenticate, missionController.getMissionById);

/**
 * @swagger
 * /missions/{missionId}/full:
 *   get:
 *     summary: Retorna dados completos de uma missão (tarefas, progresso, ranking)
 *     tags: [Missões]
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
 *         description: Dados completos da missão
 *       404:
 *         description: Missão não encontrada
 */
router.get('/:missionId/full', authenticate, checkRole(['admin', 'participante']), missionController.getMissionFullById);

/**
 * @swagger
 * /missions/{missionId}/join:
 *   post:
 *     summary: Inscrever o usuário logado em uma missão
 *     tags: [Missões]
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
 *         description: Inscrição realizada com sucesso
 *       409:
 *         description: Usuário já inscrito
 *   delete:
 *     summary: Cancelar inscrição em uma missão
 *     tags: [Missões]
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
 *         description: Inscrição cancelada com sucesso
 *       404:
 *         description: Inscrição não encontrada
 */
router.post('/:missionId/join', authenticate, checkRole(['participante']), missionController.joinMission);
router.delete('/:missionId/join', authenticate, checkRole(['participante']), missionController.leaveMission);

module.exports = router;