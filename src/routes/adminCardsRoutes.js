const express = require('express');
const router = express.Router();
const adminCardsController = require('../controllers/adminCardsController');

// Nota: Middlewares de Auth/Admin já estão no adminRoutes.js (pai)

/**
 * @route   POST /api/admin/cards
 * @route   GET /api/admin/cards
 */
router.route('/')
  .post(adminCardsController.createCard)
  .get(adminCardsController.getAllCards);

/**
 * @route   GET /api/admin/cards/:cardId
 * @route   PUT /api/admin/cards/:cardId
 * @route   DELETE /api/admin/cards/:cardId
 */
router.route('/:cardId')
  .get(adminCardsController.getCardById)
  .put(adminCardsController.updateCard)
  .delete(adminCardsController.deleteCard);

module.exports = router;