const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado
 * @access  Privado
 */
router.put('/me', authMiddleware, userController.updateMyProfile);
router.get('/me', authMiddleware, userController.getMyProfile);

// Rota para atualizar perfil (com suporte a upload de imagem)
// 'file' é o nome do campo que o Frontend envia no FormData
router.put('/me', authMiddleware, upload.single('file'), userController.updateMyProfile);

/**
 * @route   GET /api/users/:id/profile
 * @desc    Busca o perfil público de OUTRO usuário (ex: para o ranking)
 * @access  Privado
 */
router.get('/:id/profile', authMiddleware, userController.getUserProfileById);

module.exports = router;