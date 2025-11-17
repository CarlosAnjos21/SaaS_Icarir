const express = require('express');
const router = express.Router();
const awardsController = require('../controllers/adminAwardsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protege todas as rotas
router.use(authMiddleware);

/**
 * @route   GET /api/awards
 * @desc    (Usuário) Listar todas as premiações ativas
 */
router.get('/', awardsController.listAvailableAwards);

module.exports = router;