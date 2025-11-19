const express = require('express');
const categoriasController = require('../controllers/categoriasTarefasController');
const checkAdmin = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * GET /api/categorias-tarefas
 * Lista todas as categorias de tarefas
 */
router.get('/', categoriasController.getAllCategorias);

/**
 * GET /api/categorias-tarefas/:id
 * Busca uma categoria pelo ID
 */
router.get('/:id', categoriasController.getCategoriaById);

/**
 * POST /api/categorias-tarefas
 * (Admin) Cria uma nova categoria
 */
router.post('/', authMiddleware, checkAdmin, categoriasController.createCategoria);

/**
 * PUT /api/categorias-tarefas/:id
 * (Admin) Atualiza uma categoria
 */
router.put('/:id', authMiddleware, checkAdmin, categoriasController.updateCategoria);

/**
 * DELETE /api/categorias-tarefas/:id
 * (Admin) Remove uma categoria
 */
router.delete('/:id', authMiddleware, checkAdmin, categoriasController.deleteCategoria);

module.exports = router;
