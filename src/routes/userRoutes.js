const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado
 * @access  Privado
 */
router.put('/me', authMiddleware, userController.updateMyProfile);

/**
 * @route   GET /api/users/:id/profile
 * @desc    Busca o perfil público de OUTRO usuário (ex: para o ranking)
 * @access  Privado
 */
router.get('/:id/profile', userController.getUserProfileById);

module.exports = router;