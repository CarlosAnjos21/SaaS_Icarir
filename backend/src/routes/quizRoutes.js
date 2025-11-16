const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protege todas as rotas de quiz
router.use(authMiddleware);

/**
 * @route   GET /api/quizzes/:quizId
 * @desc    (Usuário) Buscar um quiz e suas perguntas (sem respostas)
 */
router.get('/:quizId', quizController.getQuizForUser);

/**
 * @route   POST /api/quizzes/:quizId/submit
 * @desc    (Usuário) Submeter respostas de um quiz
 */
router.post('/:quizId/submit', quizController.submitQuiz);

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: Rotas para resposta do quiz
 */

/**
 * @swagger
 * /quizzes/{quizId}/submit:
 *   post:
 *     summary: Responde um quiz
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_id:
 *                 type: int
 *                 example: 1
 *               pergunta_id:
 *                 type: int
 *                 example: 2
 *               resposta:
 *                 type: text
 *                 example: A resposta do usuário
 *               correta:
 *                 type: boolean
 *                 example: True
 *     responses:
 *       201:
 *         description: Quiz submentido com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */                                        

/**
 * @swagger
 * /quizzes/{quizId}:
 *   get:
 *     summary: Retorna os quizzes
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do quiz respondido
 *       401:
 *         description: Token inválido ou expirado
 */