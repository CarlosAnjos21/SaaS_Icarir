const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

// Auth/Admin já aplicados no adminRoutes.js pai

/**
 * @swagger
 * tags:
 *   name: Admin - Usuários
 *   description: Gerenciamento de usuários pelo administrador
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Lista todos os usuários com filtros opcionais
 *     tags: [Admin - Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo/inativo
 *       - in: query
 *         name: perfil
 *         schema:
 *           type: string
 *           enum: [participante, admin, validador]
 *         description: Filtrar por role
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Busca por nome ou email
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *       401:
 *         description: Não autorizado
 *   post:
 *     summary: Cria um novo usuário manualmente
 *     tags: [Admin - Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               empresa:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [participante, admin, validador]
 *               ativo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       409:
 *         description: E-mail já cadastrado
 */
router.route('/')
  .get(adminUserController.getAllUsers)
  .post(adminUserController.createUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Admin - Usuários]
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
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 *   put:
 *     summary: Atualiza dados de um usuário
 *     tags: [Admin - Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [participante, admin, validador]
 *               ativo:
 *                 type: boolean
 *               pontos:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: E-mail já em uso
 *   delete:
 *     summary: Desativa um usuário (soft delete)
 *     tags: [Admin - Usuários]
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
 *         description: Usuário desativado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.route('/:id')
  .get(adminUserController.getUserById)
  .put(adminUserController.updateUser)
  .delete(adminUserController.deleteUser);

module.exports = router;