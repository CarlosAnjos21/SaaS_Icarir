const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const adminMissionRoutes = require("./adminMissionRoutes");
const adminAwardsRoutes = require("./adminAwardsRoutes");
const adminQuizRoutes = require("./adminQuizRoutes");
const adminCardsRoutes = require("./adminCardsRoutes");
const adminUserRoutes = require("./adminUserRoutes");
const adminEnrollmentsRoutes = require("./adminEnrollmentsRoutes");
const adminTaskRoutes = require('./adminTaskRoutes');

// ✅ MIDDLEWARES DE PROTEÇÃO
// 1. Verifica se o usuário está autenticado via JWT
router.use(authMiddleware);

// 2. Verifica se o usuário tem role === 'admin'
router.use(adminMiddleware);

// --- ROTAS DE DASHBOARD ---
/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Obter estatísticas gerais do sistema
 * @access  Admin
 */
router.get("/dashboard/stats", adminController.getDashboardStats);

// --- VALIDAÇÃO DE SUBMISSÕES ---
/**
 * @route   POST /api/admin/submissions/:submissionId/validate
 * @desc    Aprovar ou reprovar uma submissão de tarefa
 * @access  Admin
 */
router.post(
  "/submissions/:submissionId/validate",
  adminController.validateTaskSubmission
);

// --- SUBROTAS ADMINISTRATIVAS ---
router.use("/enrollments", adminEnrollmentsRoutes); // /api/admin/enrollments
router.use("/missions", adminMissionRoutes);        // /api/admin/missions
router.use("/users", adminUserRoutes);              // /api/admin/users
router.use("/quizzes", adminQuizRoutes);            // /api/admin/quizzes
router.use("/awards", adminAwardsRoutes);           // /api/admin/awards
router.use("/cards", adminCardsRoutes);             // /api/admin/cards
router.use('/tasks', adminTaskRoutes);              // /api/admin/tasks

module.exports = router;