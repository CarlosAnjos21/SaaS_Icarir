const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate, checkRole } = require('../middlewares/authMiddleware');

// Proteção global
router.use(authenticate);
router.use(checkRole(['admin', 'participante']));

/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: Rotas para interação com quizzes
 */

/**
 * @swagger
 * /quizzes/task/{taskId}:
 *   get:
 *     summary: Busca o quiz associado a uma tarefa
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quiz encontrado
 *       404:
 *         description: Nenhum quiz encontrado para esta tarefa
 */
router.get('/task/:taskId', quizController.getQuizzesByTask);

/**
 * @swagger
 * /quizzes/{quizId}:
 *   get:
 *     summary: Busca um quiz pelo ID (sem respostas corretas)
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quiz encontrado
 *       404:
 *         description: Quiz não encontrado ou inativo
 */
router.get('/:quizId', quizController.getQuizForUser);

/**
 * @swagger
 * /quizzes/{quizId}/submit:
 *   post:
 *     summary: Submete respostas de um quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pergunta_id:
 *                       type: integer
 *                     resposta:
 *                       type: string
 *                 example: [{ pergunta_id: 1, resposta: "Banco digital" }]
 *     responses:
 *       200:
 *         description: Quiz submetido com sucesso
 *       409:
 *         description: Quiz já foi completado
 */
router.post('/:quizId/submit', quizController.submitQuiz);

module.exports = router;