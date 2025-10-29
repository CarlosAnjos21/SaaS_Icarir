const express = require('express');
const router = express.Router();
const adminMissionController = require('../controllers/adminMissionController');

// NOTA: Não precisamos do authMiddleware ou adminMiddleware aqui,
// pois eles já serão aplicados no 'adminRoutes.js' (o router pai).

/**
 * @route   POST /api/admin/missions
 * @desc    (Admin) Criar uma nova missão
 */
router.post('/', adminMissionController.createMission);

/**
 * @route   GET /api/admin/missions
 * @desc    (Admin) Listar TODAS as missões
 */
router.get('/', adminMissionController.getAllMissions);

/**
 * @route   GET /api/admin/missions/:missionId
 * @desc    (Admin) Buscar detalhes de uma missão
 */
router.get('/:missionId', adminMissionController.getMissionById);

/**
 * @route   PUT /api/admin/missions/:missionId
 * @desc    (Admin) Atualizar uma missão
 */
router.put('/:missionId', adminMissionController.updateMission);

/**
 * @route   DELETE /api/admin/missions/:missionId
 * @desc    (Admin) Desativar (soft delete) uma missão
 */
router.delete('/:missionId', adminMissionController.softDeleteMission);


module.exports = router;