const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const missionRoutes = require('./missionRoutes');
const adminRoutes = require('./adminRoutes');
const quizRoutes = require('./quizRoutes');
const validatorRoutes = require('./validatorRoutes');
const rankingRoutes = require('./rankingRoutes');
const taskRoutes = require('./taskRoutes');
const categoriasTarefasRoutes = require('./categoriasTarefasRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/missions', missionRoutes);
router.use('/admin', adminRoutes);
router.use('/quizzes', quizRoutes);
router.use('/validations', validatorRoutes);
router.use('/ranking', rankingRoutes);
router.use('/tasks', taskRoutes);
router.use('/categorias-tarefas', categoriasTarefasRoutes);

module.exports = router;
