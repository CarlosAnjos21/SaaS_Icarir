const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Ranking
 *   description: Ranking global de participantes
 */

/**
 * @swagger
 * /ranking:
 *   get:
 *     summary: Busca o ranking global de usuários
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranking retornado com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/', authenticate, rankingController.getGlobalRanking);

module.exports = router;