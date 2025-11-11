const express = require('express');
const router = express.Router();

// Importa as rotas de autenticação
const authRoutes = require('./authRoutes');

// Diz ao roteador para usar as rotas de autenticação
// quando a URL começar com /auth
router.use('/auth', authRoutes);

const userRoutes = require('./userRoutes');
router.use('/users', userRoutes);

const missionRoutes = require('./missionRoutes');
router.use('/missions', missionRoutes);

const adminRoutes = require('./adminRoutes');
router.use('/admin', adminRoutes);

const quizRoutes = require('./quizRoutes');
router.use('/quizzes', quizRoutes);

<<<<<<< HEAD
// // Rotas de Premiações (Ver prêmios)
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
// const awardsRoutes = require('./awardsRoutes');
// router.use('/awards', awardsRoutes);

const rankingRoutes = require('./rankingRoutes');
router.use('/ranking', rankingRoutes);

const taskRoutes = require('./taskRoutes');
router.use('/tasks', taskRoutes);

const destinationRoutes = require('./destinationRoutes');
router.use('/destinations', destinationRoutes);

module.exports = router;
