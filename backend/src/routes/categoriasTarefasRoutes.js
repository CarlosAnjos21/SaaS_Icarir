const express = require('express');
const router = express.Router();
const {
  listarCategorias,
  buscarCategoriaPorId,
  criarCategoria,
  atualizarCategoria,
  deletarCategoria
} = require('../controllers/categoriasTarefasController');

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rotas públicas/autenticadas (listar e buscar)
router.get('/', authMiddleware, listarCategorias);
router.get('/:id', authMiddleware, buscarCategoriaPorId);

// Rotas administrativas (criar, atualizar, deletar)
router.post('/', authMiddleware, adminMiddleware, criarCategoria);
router.put('/:id', authMiddleware, adminMiddleware, atualizarCategoria);
router.delete('/:id', authMiddleware, adminMiddleware, deletarCategoria);

module.exports = router;
