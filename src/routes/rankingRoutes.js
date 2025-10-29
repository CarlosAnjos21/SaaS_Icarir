const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protege a rota de ranking
router.use(authMiddleware);

/**
 * @route   GET /api/ranking
 * @desc    Busca o ranking global de usuários
 */
router.get('/', rankingController.getGlobalRanking);

module.exports = router;