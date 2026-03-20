const express = require('express');
const router = express.Router();
const adminCardsController = require('../controllers/adminCardsController');

// Auth/Admin já aplicados no adminRoutes.js pai

/**
 * @swagger
 * tags:
 *   name: Admin - Cards
 *   description: Rotas administrativas para gerenciar os cards
 */

/**
 * @swagger
 * /admin/cards:
 *   post:
 *     summary: Cria um novo card
 *     tags: [Admin - Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, tipo]
 *             properties:
 *               titulo:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [empresa, destino, lider]
 *               raridade:
 *                 type: string
 *                 enum: [comum, raro, epico]
 *               imagem_url:
 *                 type: string
 *               tarefa_requerida:
 *                 type: integer
 *               ativo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Card criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *   get:
 *     summary: Lista todos os cards
 *     tags: [Admin - Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cards retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.route('/')
  .post(adminCardsController.createCard)
  .get(adminCardsController.getAllCards);

/**
 * @swagger
 * /admin/cards/{cardId}:
 *   get:
 *     summary: Busca um card pelo ID
 *     tags: [Admin - Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Card encontrado
 *       404:
 *         description: Card não encontrado
 *   put:
 *     summary: Atualiza um card existente
 *     tags: [Admin - Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
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
 *               titulo:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [empresa, destino, lider]
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Card atualizado com sucesso
 *       404:
 *         description: Card não encontrado
 *   delete:
 *     summary: Desativa (soft delete) um card
 *     tags: [Admin - Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Card desativado com sucesso
 *       404:
 *         description: Card não encontrado
 */
router.route('/:cardId')
  .get(adminCardsController.getCardById)
  .put(adminCardsController.updateCard)
  .delete(adminCardsController.deleteCard);

module.exports = router;