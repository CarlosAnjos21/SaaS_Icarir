const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Perfil e dados do usuário logado
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Retorna os dados do usuário logado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil retornados com sucesso
 *       401:
 *         description: Não autorizado
 *   put:
 *     summary: Atualiza o perfil do usuário logado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               curiosidades:
 *                 type: string
 *               linkedin_url:
 *                 type: string
 *               telefone:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       409:
 *         description: E-mail já em uso
 */
router.get('/me', authenticate, userController.getMyProfile);
router.put('/me', authenticate, upload.single('file'), userController.updateMyProfile);

/**
 * @swagger
 * /users/{id}/profile:
 *   get:
 *     summary: Busca o perfil público de outro usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *       404:
 *         description: Perfil não encontrado
 */
router.get('/:id/profile', authenticate, userController.getUserProfileById);

module.exports = router;