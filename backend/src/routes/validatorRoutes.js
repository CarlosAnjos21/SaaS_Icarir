const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const validatorMiddleware = require('../middlewares/validatorMiddleware');
const validatorController = require('../controllers/validatorController');

// Protege com JWT e verifica role (validador/admin)
router.use(authMiddleware);
router.use(validatorMiddleware);

/**
 * GET /api/validations/pending
 * Lista validações pendentes de usuários_tarefas
 */
router.get('/pending', validatorController.getPendingValidations);

module.exports = router;
