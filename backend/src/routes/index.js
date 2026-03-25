const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");

const authRoutes = require("./authRoutes");
router.use("/auth", authRoutes);

const userRoutes = require("./userRoutes");
const missionRoutes = require("./missionRoutes");
const quizRoutes = require("./quizRoutes");
const rankingRoutes = require("./rankingRoutes");
const taskRoutes = require("./taskRoutes");
const validatorRoutes = require("./validatorRoutes");
const taskCategoriesRoutes = require("./taskCategoriesRoutes");

router.use("/users",           authenticate, userRoutes);
router.use("/missions",        authenticate, missionRoutes);
router.use("/quizzes",         authenticate, quizRoutes);
router.use("/ranking",         authenticate, rankingRoutes);
router.use("/tasks",           authenticate, taskRoutes);
router.use("/validations",     authenticate, validatorRoutes);
router.use("/task-categories", authenticate, taskCategoriesRoutes); 

const adminRoutes = require("./adminRoutes");
router.use("/admin", adminRoutes);

module.exports = router;
