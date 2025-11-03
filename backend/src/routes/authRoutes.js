const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas Públicas (não precisam de authMiddleware)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken); // Endpoint de renovação

// Rotas Protegidas (precisam de authMiddleware)
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe); // Endpoint do perfil logado

module.exports = router;