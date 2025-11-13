const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const authMiddleware = require("../middlewares/authMiddleware");

// 1. Importar as rotas de tarefas
const taskRoutes = require("./taskRoutes");

const missoesPorDestino = {
  Paris: [{ id: 101, title: "Tour Eiffel Challenge", pontos: 200 }],
  Tokyo: [{ id: 102, title: "Shibuya Sprint", pontos: 150 }],
  "New York": [{ id: 103, title: "Central Park Quest", pontos: 180 }],
  London: [{ id: 104, title: "Big Ben Blitz", pontos: 170 }],
  Rome: [{ id: 105, title: "Colosseum Conqueror", pontos: 160 }],
  Dubai: [{ id: 106, title: "Burj Khalifa Climb", pontos: 190 }],
  Sydney: [{ id: 107, title: "Opera House Odyssey", pontos: 175 }],
  "Rio de Janeiro": [{ id: 108, title: "Cristo Redentor Run", pontos: 165 }],
  "Cape Town": [{ id: 109, title: "Table Mountain Trek", pontos: 155 }],
  Bangkok: [{ id: 110, title: "Temple Trail", pontos: 145 }],
  Barcelona: [{ id: 111, title: "Gaudí Gallery Hunt", pontos: 185 }],
  Toronto: [{ id: 112, title: "CN Tower Challenge", pontos: 160 }],
};

// Aplica o middleware de autenticação a TODAS as rotas de missão e sub-rotas
router.use(authMiddleware);

// 2. Aninhar as rotas de tarefas
// Qualquer requisição para /api/missions/:missionId/tasks
// será redirecionada para o 'taskRoutes'
router.use("/:missionId/tasks", taskRoutes);

/**
 * @route   GET /api/missions
 * @desc    Listar todas as missões ativas
 */
router.get("/", missionController.getAllActiveMissions);

/**
 * @route   GET /api/missions/:missionId
 * @desc    Buscar detalhes de uma missão específica
 */
router.get("/:missionId", missionController.getMissionById);

/**
 * @route   GET /api/missions/:missionId/full
 * @desc    Retorna os dados completos de uma missão para o front (tarefas, inscritos, logs, contagens)
 */
router.get("/:missionId/full", missionController.getMissionFullById);

/**
 * @route   POST /api/missions/:missionId/join
 * @desc    Inscrever o usuário logado em uma missão
 * @access  Privado
 */
router.post("/:missionId/join", missionController.joinMission); // <<< ADICIONADO

router.get("/by-destination/:city", (req, res) => {
  const { city } = req.params;
  const missoes = missoesPorDestino[city] || [];
  res.json(missoes);
});

module.exports = router;
