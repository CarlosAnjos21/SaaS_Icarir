const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware'); // 🛑 Importação corrigida
const upload = require('../middlewares/uploadMiddleware');

/*
 * @route   GET /api/users/me
 * @desc    Retorna os dados do usuário logado
 * @access  Privado
 */
router.get('/me', authenticate, userController.getMyProfile); // 🛑 Uso corrigido

/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado (com suporte a upload de imagem)
 * @access  Privado
 */
router.put('/me', authenticate, upload.single('file'), userController.updateMyProfile); // 🛑 Uso corrigido

/**
 * @route   GET /api/users/:id/profile
 * @desc    Busca o perfil público de OUTRO usuário (ex: para o ranking)
 * @access  Privado
 */
router.get('/:id/profile', authenticate, userController.getUserProfileById); // 🛑 Uso corrigido

module.exports = router;