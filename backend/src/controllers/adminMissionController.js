<<<<<<< HEAD
// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para tratamento de erro
=======
// Importa o Prisma Client e tratamento de erros
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

/**
 * @route   POST /api/admin/missions
 * @desc    (Admin) Criar uma nova missão
 * @access  Admin
 */
const createMission = async (req, res) => {
<<<<<<< HEAD
  // Baseado nos campos da tabela 'missoes' 
  const {
    titulo, // [cite: 254]
    descricao, // [cite: 257]
    foto_url, // [cite: 55]
    destino, // [cite: 258]
    data_inicio, // 
    data_fim, // 
    preco, // 
    vagas_disponiveis, // 
    ativo, // 
    missao_anterior_id // [cite: 280]
=======
  const {
    titulo,
    descricao,
    foto_url,
    destino,
    data_inicio,
    data_fim,
    preco,
    vagas_disponiveis,
    ativo,
    missao_anterior_id
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
  } = req.body;

  if (!titulo || !data_inicio || !data_fim) {
    return res.status(400).json({ error: 'Título, data de início e data de fim são obrigatórios.' });
  }

  try {
    const newMission = await prisma.missoes.create({
      data: {
        titulo,
        descricao: descricao || null,
        foto_url: foto_url || null,
        destino: destino || null,
        data_inicio: new Date(data_inicio),
        data_fim: new Date(data_fim),
        preco: preco ? parseFloat(preco) : 0.00,
        vagas_disponiveis: vagas_disponiveis ? parseInt(vagas_disponiveis, 10) : null,
        ativo: ativo ?? true,
        missao_anterior_id: missao_anterior_id ? parseInt(missao_anterior_id, 10) : null
      }
    });

    res.status(201).json({
      message: 'Missão criada com sucesso!',
      mission: newMission
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(400).json({ error: 'ID da missão anterior (missao_anterior_id) é inválido.' });
    }
<<<<<<< HEAD
=======

>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    console.error('Erro ao criar missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/missions
 * @desc    (Admin) Listar todas as missões (ativas e inativas)
 * @access  Admin
 */
const getAllMissions = async (req, res) => {
  try {
<<<<<<< HEAD
    // Admins veem tudo, não apenas as ativas
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    const missions = await prisma.missoes.findMany({
      orderBy: { data_inicio: 'desc' }
    });

    res.json(missions);
  } catch (error) {
    console.error('Erro ao buscar todas as missões:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/missions/:missionId
 * @desc    (Admin) Buscar detalhes de uma missão específica
 * @access  Admin
 */
const getMissionById = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  if (isNaN(missionId)) {
    return res.status(400).json({ error: 'ID da missão inválido.' });
  }

  try {
<<<<<<< HEAD
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
        return res.status(400).json({ error: 'ID da missão inválido.' });
    }
    
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    const mission = await prisma.missoes.findUnique({
      where: { id: missionId }
    });

    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }
<<<<<<< HEAD
    res.json(mission);
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

    res.json(mission);
  } catch (error) {
    console.error('Erro ao buscar missão por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/admin/missions/:missionId
 * @desc    (Admin) Atualizar uma missão
 * @access  Admin
 */
const updateMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  if (isNaN(missionId)) {
    return res.status(400).json({ error: 'ID da missão inválido.' });
  }

  const {
    titulo,
    descricao,
    foto_url,
    destino,
    data_inicio,
    data_fim,
    preco,
    vagas_disponiveis,
    ativo,
    missao_anterior_id
  } = req.body;

  if (!titulo || !data_inicio || !data_fim) {
    return res.status(400).json({ error: 'Título, data de início e data de fim são obrigatórios.' });
  }

  try {
<<<<<<< HEAD
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
        return res.status(400).json({ error: 'ID da missão inválido.' });
    }

    const {
      titulo, descricao, foto_url, destino, data_inicio, 
      data_fim, preco, vagas_disponiveis, ativo, missao_anterior_id
    } = req.body;

    if (!titulo || !data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Título, data de início e data de fim são obrigatórios.' });
    }

=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    const updatedMission = await prisma.missoes.update({
      where: { id: missionId },
      data: {
        titulo,
        descricao: descricao || null,
        foto_url: foto_url || null,
        destino: destino || null,
        data_inicio: new Date(data_inicio),
        data_fim: new Date(data_fim),
        preco: preco ? parseFloat(preco) : 0.00,
        vagas_disponiveis: vagas_disponiveis ? parseInt(vagas_disponiveis, 10) : null,
        ativo,
        missao_anterior_id: missao_anterior_id ? parseInt(missao_anterior_id, 10) : null
      }
    });

    res.json({
      message: 'Missão atualizada com sucesso!',
      mission: updatedMission
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Missão não encontrada para atualizar.' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'ID da missão anterior (missao_anterior_id) é inválido.' });
      }
    }
<<<<<<< HEAD
    // Erro de FK (missao_anterior_id não existe)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
       return res.status(404).json({ error: 'ID da missão anterior (missao_anterior_id) é inválido.' });
    }
=======

>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    console.error('Erro ao atualizar missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/missions/:missionId
 * @desc    (Admin) Desativar (soft delete) uma missão
 * @access  Admin
 */
const softDeleteMission = async (req, res) => {
<<<<<<< HEAD
=======
  const missionId = parseInt(req.params.missionId, 10);
  if (isNaN(missionId)) {
    return res.status(400).json({ error: 'ID da missão inválido.' });
  }

>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
  try {
    const deletedMission = await prisma.missoes.update({
      where: { id: missionId },
      data: { ativo: false }
    });

    res.json({
      message: 'Missão desativada (soft delete) com sucesso!',
      mission: deletedMission
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Missão não encontrada para deletar.' });
    }
<<<<<<< HEAD
=======

>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    console.error('Erro ao deletar missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  createMission,
  getAllMissions,
  getMissionById,
  updateMission,
  softDeleteMission
};
