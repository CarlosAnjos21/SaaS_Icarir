const express = require('express');
const router = express.Router();
const taskCategoriesController = require('../controllers/taskCategoriesController'); // controller em inglês
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Categorias de Tarefas
 *   description: Rotas para gerenciamento de categorias de tarefas
 */

/**
 * @swagger
 * /categorias-tarefas:
 *   get:
 *     summary: Lista todas as categorias de tarefas
 *     tags: [Categorias de Tarefas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso
 *       401:
 *         description: Token inválido ou ausente
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', authenticate, taskCategoriesController.getAllTaskCategories);

/**
 * @swagger
 * /categorias-tarefas/{id}:
 *   get:
 *     summary: Busca uma categoria de tarefa pelo ID
 *     tags: [Categorias de Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da categoria
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoria retornada com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token inválido ou ausente
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', authenticate, taskCategoriesController.getTaskCategoryById);

/**
 * @swagger
 * /categorias-tarefas:
 *   post:
 *     summary: Cria uma nova categoria de tarefa
 *     tags: [Categorias de Tarefas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Estudo"
 *               description:
 *                 type: string
 *                 example: "Tarefas relacionadas aos estudos"
 *               icon:
 *                 type: string
 *                 example: "book"
 *               color:
 *                 type: string
 *                 example: "#FF0000"
 *               order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Campo obrigatório ausente
 *       401:
 *         description: Token inválido ou ausente
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', authenticate, taskCategoriesController.createTaskCategory);

/**
 * @swagger
 * /categorias-tarefas/{id}:
 *   put:
 *     summary: Atualiza uma categoria de tarefa existente
 *     tags: [Categorias de Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da categoria
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Estudos Atualizados"
 *               description:
 *                 type: string
 *                 example: "Nova descrição das tarefas de estudo"
 *               icon:
 *                 type: string
 *                 example: "book-open"
 *               color:
 *                 type: string
 *                 example: "#00FF00"
 *               order:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token inválido ou ausente
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', authenticate, taskCategoriesController.updateTaskCategory);

/**
 * @swagger
 * /categorias-tarefas/{id}:
 *   delete:
 *     summary: Remove uma categoria de tarefa
 *     tags: [Categorias de Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da categoria
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoria removida com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token inválido ou ausente
 *       404:
 *         description: Categoria não encontrada
 *       409:
 *         description: Existem tarefas vinculadas a esta categoria
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', authenticate, taskCategoriesController.deleteTaskCategory);

module.exports = router;