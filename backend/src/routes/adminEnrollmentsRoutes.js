const express = require('express');
const router = express.Router();
const adminEnrollmentsController = require('../controllers/adminEnrollmentsController');

// Auth/Admin já aplicados no adminRoutes.js pai

/**
 * @swagger
 * tags:
 *   name: Admin - Inscrições
 *   description: Gerenciamento de inscrições em missões
 */

/**
 * @swagger
 * /admin/enrollments:
 *   get:
 *     summary: Lista todas as inscrições (com filtros opcionais)
 *     tags: [Admin - Inscrições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         description: Filtrar por usuário
 *       - in: query
 *         name: missao_id
 *         schema:
 *           type: integer
 *         description: Filtrar por missão
 *     responses:
 *       200:
 *         description: Lista de inscrições retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.route('/')
  .get(adminEnrollmentsController.getAllEnrollments);

/**
 * @swagger
 * /admin/enrollments/{id}:
 *   get:
 *     summary: Busca uma inscrição pelo ID
 *     tags: [Admin - Inscrições]
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
 *         description: Inscrição encontrada
 *       404:
 *         description: Inscrição não encontrada
 *   patch:
 *     summary: Atualiza o status de uma inscrição
 *     tags: [Admin - Inscrições]
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
 *               status_pagamento:
 *                 type: string
 *                 enum: [pendente, pago, cancelado, reembolsado]
 *               status_participacao:
 *                 type: string
 *                 enum: [inscrito, confirmado, concluido, cancelado]
 *               valor_pago:
 *                 type: number
 *     responses:
 *       200:
 *         description: Inscrição atualizada com sucesso
 *       404:
 *         description: Inscrição não encontrada
 *   delete:
 *     summary: Remove uma inscrição (hard delete)
 *     tags: [Admin - Inscrições]
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
 *         description: Inscrição removida com sucesso
 *       404:
 *         description: Inscrição não encontrada
 */
router.route('/:id')
  .get(adminEnrollmentsController.getEnrollmentById)
  .patch(adminEnrollmentsController.updateEnrollment)
  .delete(adminEnrollmentsController.deleteEnrollment);

module.exports = router;