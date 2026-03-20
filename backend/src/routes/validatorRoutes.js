const express = require('express');
const router = express.Router();
const validatorController = require('../controllers/validatorController');
const { authenticate, checkRole } = require('../middlewares/authMiddleware');

// Proteção global — validador ou admin
router.use(authenticate);
router.use(checkRole(['admin', 'validador'])); // 'validador' conforme enum do schema

/**
 * @swagger
 * tags:
 *   name: Validações
 *   description: Rotas para validadores e administradores
 */

/**
 * @swagger
 * /validations/pending:
 *   get:
 *     summary: Lista submissões pendentes de validação
 *     tags: [Validações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tarefa_id
 *         schema:
 *           type: integer
 *         description: Filtrar por tarefa
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         description: Filtrar por usuário
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página (padrão 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Itens por página (máx 200)
 *     responses:
 *       200:
 *         description: Lista de pendências retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Permissão insuficiente
 */
router.get('/pending', validatorController.getPendingValidations);

module.exports = router;