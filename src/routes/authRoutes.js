const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota POST para /api/auth/register
router.post('/register', authController.register);

// Rota POST para /api/auth/login
router.post('/login', authController.login);

module.exports = router;