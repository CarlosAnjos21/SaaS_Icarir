const express = require('express');
const router = express.Router();
const adminMissionController = require('../controllers/adminMissionController');

// NOTA: Não precisamos do authMiddleware ou adminMiddleware aqui,
// pois eles já serão aplicados no 'adminRoutes.js' (o router pai).

/**
 * @route   POST /api/admin/missions
 * @desc    (Admin) Criar uma nova missão
 */
router.post('/', adminMissionController.createMission);

/**
 * @route   GET /api/admin/missions
 * @desc    (Admin) Listar TODAS as missões
 */
router.get('/', adminMissionController.getAllMissions);

/**
 * @route   GET /api/admin/missions/:missionId
 * @desc    (Admin) Buscar detalhes de uma missão
 */
router.get('/:missionId', adminMissionController.getMissionById);

/**
 * @route   PUT /api/admin/missions/:missionId
 * @desc    (Admin) Atualizar uma missão
 */
router.put('/:missionId', adminMissionController.updateMission);

/**
 * @route   DELETE /api/admin/missions/:missionId
 * @desc    (Admin) Desativar (soft delete) uma missão
 */
router.delete('/:missionId', adminMissionController.softDeleteMission);


module.exports = router;

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
<<<<<<< HEAD
=======
 *     security:
 *       - bearerAuth: []
>>>>>>> davi-dev
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
<<<<<<< HEAD
 *                 example: "Missão: Concluir primeiro quiz"
 *               descricao:
 *                 type: string
 *                 example: "Responda o primeiro quiz corretamente para completar esta missão."
 *               pontuacao:
 *                 type: integer
 *                 example: 100
 *               ativa:
 *                 type: boolean
 *                 example: true
=======
 *                 example: "Missão Nubank"
 *               descricao:
 *                 type: string
 *                 example: "Nesta missão vamos a sede da Nubank em São Paulo."
 *               foto_url:
 *                 type: string
 *                 example: "imagem.com"
 *               destino:
 *                 type: string
 *                 example: "São Paulo"
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
 *                 example: 20
 *               ativo:
 *                 type: boolean
 *                 example: true
 *               missao_anterior_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
>>>>>>> davi-dev
 *     responses:
 *       201:
 *         description: Missão criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
<<<<<<< HEAD
 *
=======
 * 
 * 
>>>>>>> davi-dev
 *   get:
 *     summary: Lista todas as missões
 *     tags: [Admin - Missões]
 *     responses:
 *       200:
 *         description: Lista de missões retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 *                   descricao:
 *                     type: string
 *                   pontuacao:
 *                     type: integer
 *                   ativa:
 *                     type: boolean
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /admin/missions/{missionId}:
 *   get:
 *     summary: Busca uma missão pelo ID
 *     tags: [Admin - Missões]
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da missão
 *     responses:
 *       200:
 *         description: Missão encontrada
 *       404:
 *         description: Missão não encontrada
 *       401:
 *         description: Não autorizado
 *
 *   put:
 *     summary: Atualiza uma missão existente
 *     tags: [Admin - Missões]
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da missão
 *     requestBody:
<<<<<<< HEAD
 *       required: true
=======
 *       required: false
>>>>>>> davi-dev
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Missão Atualizada"
 *               descricao:
 *                 type: string
 *                 example: "Nova descrição da missão"
<<<<<<< HEAD
 *               pontuacao:
 *                 type: integer
 *                 example: 150
=======
 *               preco:
 *                 type: integer
 *                 example: 1500
>>>>>>> davi-dev
 *               ativa:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Missão atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Missão não encontrada
 *       401:
 *         description: Não autorizado
 *
 *   delete:
 *     summary: Desativa (soft delete) uma missão
 *     tags: [Admin - Missões]
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da missão
 *     responses:
 *       200:
 *         description: Missão desativada com sucesso
 *       404:
 *         description: Missão não encontrada
 *       401:
 *         description: Não autorizado
 */
<<<<<<< HEAD

/**
 * @swagger
 * /missions/{missionId}/tasks/{taskId}/evidences:
 *   post:
 *     summary: Upload de evidências para uma tarefa
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Evidências recebidas com sucesso
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Não autorizado
 */

module.exports = router;
=======
>>>>>>> davi-dev
