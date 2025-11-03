const express = require('express');
const router = express.Router();
const adminQuizController = require('../controllers/adminQuizController');

// --- ROTAS /api/admin/quizzes ---

router.route('/')
  .post(adminQuizController.createQuiz)
  .get(adminQuizController.getAllQuizzes);

router.route('/:quizId')
  .get(adminQuizController.getQuizById)
  .put(adminQuizController.updateQuiz)
  .delete(adminQuizController.deleteQuiz);

// --- ROTAS ANINHADAS DE PERGUNTAS ---
// /api/admin/quizzes/:quizId/questions

router.route('/:quizId/questions')
  .post(adminQuizController.createQuestionForQuiz)
  .get(adminQuizController.getQuestionsForQuiz);

router.route('/:quizId/questions/:questionId')
  .put(adminQuizController.updateQuestion)
  .delete(adminQuizController.deleteQuestion);

module.exports = router;