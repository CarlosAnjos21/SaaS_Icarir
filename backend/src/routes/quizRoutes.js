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