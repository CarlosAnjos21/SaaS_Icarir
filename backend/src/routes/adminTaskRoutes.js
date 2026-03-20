const express = require('express');
const router = express.Router();
const adminTaskController = require('../controllers/adminTaskController');

// Auth/Admin já aplicados no adminRoutes.js pai

/**
 * @swagger
 * tags:
 *   name: Admin - Tarefas
 *   description: Gerenciamento de tarefas pelo administrador
 */

/**
 * @swagger
 * /admin/tasks:
 *   get:
 *     summary: Lista todas as tarefas
 *     tags: [Admin - Tarefas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tarefas retornada com sucesso
 *       401:
 *         description: Não autorizado
 *   post:
 *     summary: Cria uma nova tarefa
 *     tags: [Admin - Tarefas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [missao_id, titulo]
 *             properties:
 *               missao_id:
 *                 type: integer
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               instrucoes:
 *                 type: string
 *               pontos:
 *                 type: integer
 *               tipo:
 *                 type: string
 *                 enum: [administrativa, conhecimento, engajamento, social, feedback]
 *               dificuldade:
 *                 type: string
 *                 enum: [facil, medio, dificil]
 *               ordem:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.route('/')
  .get(adminTaskController.getAllTasks)
  .post(adminTaskController.createTask);

/**
 * @swagger
 * /admin/tasks/{id}:
 *   get:
 *     summary: Busca uma tarefa pelo ID
 *     tags: [Admin - Tarefas]
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
 *         description: Tarefa encontrada
 *       404:
 *         description: Tarefa não encontrada
 *   put:
 *     summary: Atualiza uma tarefa existente
 *     tags: [Admin - Tarefas]
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
 *               titulo:
 *                 type: string
 *               pontos:
 *                 type: integer
 *               ativa:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *   delete:
 *     summary: Desativa uma tarefa (soft delete)
 *     tags: [Admin - Tarefas]
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
 *         description: Tarefa desativada com sucesso
 *       404:
 *         description: Tarefa não encontrada
 */
router.route('/:id')
  .get(adminTaskController.getTaskById)
  .put(adminTaskController.updateTask)
  .delete(adminTaskController.deleteTask);

module.exports = router;