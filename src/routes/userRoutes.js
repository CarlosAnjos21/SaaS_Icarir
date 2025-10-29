const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware =require('../middlewares/authMiddleware');

/**
 * @route   GET /api/users/me
 * @desc    Busca os dados do perfil completo do usuário logado
 * @access  Privado
 */
router.get('/me', authMiddleware, userController.getMyProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado
 * @access  Privado
 */
router.put('/me', authMiddleware, userController.updateMyProfile); // <<< ROTA ADICIONADA

module.exports = router;