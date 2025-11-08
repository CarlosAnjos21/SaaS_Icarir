const express = require('express');
const router = express.Router();
const {
  listarTarefas,
  buscarTarefaPorId,
  criarTarefa,
  atualizarTarefa,
  deletarTarefa,
  listarTarefasPorMissao
} = require('../controllers/adminTaskController');

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Todas as rotas requerem autenticação e permissão de admin
router.use(authMiddleware, adminMiddleware);

// CRUD de tarefas
router.get('/', listarTarefas);
router.get('/missao/:missao_id', listarTarefasPorMissao);
router.get('/:id', buscarTarefaPorId);
router.post('/', criarTarefa);
router.put('/:id', atualizarTarefa);
router.delete('/:id', deletarTarefa);

module.exports = router;
