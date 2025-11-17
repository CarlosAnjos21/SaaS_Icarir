const express = require('express');
const taskController = require('../controllers/taskController');
const checkAdmin = require('../middlewares/adminMiddleware');

// Multer para upload de arquivos
const multer = require('multer');
// Middleware de autenticação
const authMiddleware = require('../middlewares/authMiddleware');

// Configuração do Multer para armazenar arquivos de evidências
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/evidences'); // já criou essa pasta
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB


// IMPORTANTE: { mergeParams: true }
// Isso permite que este router acesse os parâmetros da rota pai (o :missionId)
const router = express.Router({ mergeParams: true });

/**
 * @route   GET /api/missions/:missionId/tasks
 * @desc    Listar todas as tarefas ativas de uma missão
 */
router.get('/', taskController.getTasksByMissionId);

/**
 * @route   POST /api/missions/:missionId/tasks
 * @desc    (Admin) Criar uma nova tarefa para uma missão
 */
// Usamos o checkAdmin aqui!
router.post('/', checkAdmin, taskController.createTaskForMission);

/**
 * @route   GET /api/missions/:missionId/tasks/:taskId
 * @desc    (Usuário) Buscar uma tarefa específica pelo ID
 */
router.get('/:taskId', taskController.getTaskById);

/**
 * @route   POST /api/missions/:missionId/tasks/:taskId/submit
 * @desc    (Usuário) Submeter uma tarefa para validação
 */
router.post('/:taskId/submit', taskController.submitTask);


/**
 * @route   POST /api/missions/:missionId/tasks/:taskId/evidences
 * @desc    (Usuário) Upload de evidências (arquivos) para uma tarefa
 * @access  Private (bearer token)
 */
router.post('/:taskId/evidences', authMiddleware, upload.array('files', 5), taskController.uploadEvidence);

module.exports = router;