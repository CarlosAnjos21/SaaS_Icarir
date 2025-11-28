// Importa o Prisma Client e tratamento de erros
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

/**
 * @route   POST /api/admin/missions
 * @desc    (Admin) Criar uma nova missão
 * @access  Admin
 */
const createMission = async (req, res) => {
  const {
    titulo,
    descricao,
    destino,
    data_inicio,
    data_fim,
    preco,
    vagas_disponiveis,
    ativa,
    missao_anterior_id
  } = req.body;

  if (!titulo || !data_inicio || !data_fim) {
    return res.status(400).json({ error: 'Título, data de início e data de fim são obrigatórios.' });
  }

  try {
    const newMission = await prisma.missao.create({
      data: {
        titulo,
        descricao: descricao || null,
        // foto_url: foto_url || null,
        destino: destino || null,
        data_inicio: new Date(data_inicio),
        data_fim: new Date(data_fim),
        preco: preco ? parseFloat(preco) : 0.00,
        vagas_disponiveis: vagas_disponiveis ? parseInt(vagas_disponiveis, 10) : null,
        ativa: ativo ?? true,
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
    const missions = await prisma.missao.findMany({
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
    const mission = await prisma.missao.findUnique({
      where: { id: missionId }
    });

    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }

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
    destino,
    data_inicio,
    data_fim,
    preco,
    vagas_disponiveis,
    ativa,
    missao_anterior_id
  } = req.body;

  // Objeto para armazenar dados enviados para atualização de missão.
  const dataToUpdate = {};

  if (titulo !== undefined) dataToUpdate.titulo = titulo;
  if (descricao !== undefined) dataToUpdate.descricao = descricao;
  if (foto_url !== undefined) dataToUpdate.foto_url = foto_url;
  if (destino !== undefined) dataToUpdate.destino = destino;

  if (data_inicio !== undefined) dataToUpdate.data_inicio = new Date(data_inicio);
  if (data_fim !== undefined) dataToUpdate.data_fim = new Date(data_fim);

  if (preco !== undefined) dataToUpdate.preco = parseFloat(preco);
  if (vagas_disponiveis !== undefined) dataToUpdate.vagas_disponiveis = parseInt(vagas_disponiveis, 10);

  if (ativo !== undefined) dataToUpdate.ativo = ativo;
  if (missao_anterior_id !== undefined) {
    dataToUpdate.missao_anterior_id = missao_anterior_id ? parseInt(missao_anterior_id, 10) : null;
  }

  try {
    const updatedMission = await prisma.missao.update({
      where: { id: missionId },
      data: dataToUpdate
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
  const missionId = parseInt(req.params.missionId, 10);
  if (isNaN(missionId)) {
    return res.status(400).json({ error: 'ID da missão inválido.' });
  }

  try {
    const deletedMission = await prisma.missao.update({
      where: { id: missionId },
      data: { ativa: false }
    });

    res.json({
      message: 'Missão desativada (soft delete) com sucesso!',
      mission: deletedMission
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Missão não encontrada para deletar.' });
    }

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
