const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const upload = require('../middlewares/uploadMiddleware');

// Rotas Públicas (não precisam de authMiddleware)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken); // Endpoint de renovação

// Rotas Protegidas (precisam de authMiddleware)
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe); // Endpoint do perfil logado

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Rotas para login, cadastro e gerenciamento de sessão
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Davi Henrique
 *               email:
 *                 type: string
 *                 example: davi@example.com
 *               senha:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos ou usuário já existente
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza o login de um usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: davi@example.com
 *               senha:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login realizado com sucesso (retorna tokens)
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Gera um novo token de acesso usando o token de refresh
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Novo token gerado com sucesso
 *       401:
 *         description: Token de refresh inválido ou expirado
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Encerra a sessão do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *       401:
 *         description: Token inválido ou ausente
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retorna os dados do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *       401:
 *         description: Token inválido ou expirado
 */

