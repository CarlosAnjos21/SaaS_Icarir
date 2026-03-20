const express = require('express');
const router = express.Router();
const adminMissionController = require('../controllers/adminMissionController');
const missionController = require('../controllers/missionController');

// Auth/Admin já aplicados no adminRoutes.js pai

/**
 * @swagger
 * tags:
 *   name: Admin - Missões
 *   description: Rotas administrativas para gerenciamento de missões
 */

/**
 * @swagger
 * /admin/missions:
 *   post:
 *     summary: Cria uma nova missão
 *     tags: [Admin - Missões]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, data_inicio, data_fim]
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Missão Nubank
 *               descricao:
 *                 type: string
 *               destino:
 *                 type: string
 *                 example: São Paulo
 *               foto_url:
 *                 type: string
 *               data_inicio:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-20"
 *               data_fim:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-30"
 *               preco:
 *                 type: number
 *                 example: 1500.50
 *               vagas_disponiveis:
 *                 type: integer
 *               ativa:
 *                 type: boolean
 *               missao_anterior_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Missão criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *   get:
 *     summary: Lista todas as missões
 *     tags: [Admin - Missões]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de missões retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.route('/')
  .post(adminMissionController.createMission)
  .get(adminMissionController.getAllMissions);

/**
 * @swagger
 * /admin/missions/{missionId}:
 *   get:
 *     summary: Busca uma missão pelo ID
 *     tags: [Admin - Missões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Missão encontrada
 *       404:
 *         description: Missão não encontrada
 *   put:
 *     summary: Atualiza uma missão existente
 *     tags: [Admin - Missões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               ativa:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Missão atualizada com sucesso
 *       404:
 *         description: Missão não encontrada
 *   delete:
 *     summary: Desativa (soft delete) uma missão
 *     tags: [Admin - Missões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Missão desativada com sucesso
 *       404:
 *         description: Missão não encontrada
 */
router.route('/:missionId')
  .get(adminMissionController.getMissionById)
  .put(adminMissionController.updateMission)
  .delete(adminMissionController.softDeleteMission);

/**
 * @swagger
 * /admin/missions/{missionId}/participants:
 *   get:
 *     summary: Lista participantes de uma missão
 *     tags: [Admin - Missões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de participantes
 *   post:
 *     summary: Vincula um participante manualmente
 *     tags: [Admin - Missões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Participante adicionado
 *       409:
 *         description: Usuário já inscrito
 */
router.route('/:missionId/participants')
  .get(missionController.getMissionParticipants)
  .post(missionController.addParticipantToMission);

/**
 * @swagger
 * /admin/missions/{missionId}/participants/{userId}:
 *   delete:
 *     summary: Remove um participante da missão
 *     tags: [Admin - Missões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Participante removido
 *       404:
 *         description: Inscrição não encontrada
 */
router.delete('/:missionId/participants/:userId', missionController.removeParticipantFromMission);

module.exports = router;