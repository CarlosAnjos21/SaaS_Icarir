const express = require('express');
const router = express.Router();
<<<<<<< HEAD
// const awardsController = require('../controllers/awardsController');
=======
const awardsController = require('../controllers/adminAwardsController');
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
const authMiddleware = require('../middlewares/authMiddleware');

// Protege todas as rotas
router.use(authMiddleware);

/**
 * @route   GET /api/awards
 * @desc    (Usuário) Listar todas as premiações ativas
 */
// router.get('/', awardsController.listAvailableAwards);

module.exports = router;