const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

const serializeMission = (m) => ({
  ...m,
  preco: m.preco ? parseFloat(m.preco.toString()) : null,
});

const createMission = async (req, res) => {
  const { titulo, descricao, destino, data_inicio, data_fim, preco, vagas_disponiveis, ativa, missao_anterior_id, foto_url } = req.body;

  if (!titulo || !data_inicio || !data_fim) {
    return res.status(400).json({ error: 'Título, data de início e data de fim são obrigatórios.' });
  }

  try {
    const mission = await prisma.missao.create({
      data: {
        titulo,
        descricao: descricao || null,
        foto_url: foto_url || null,
        destino: destino || null,
        data_inicio: new Date(data_inicio),
        data_fim: new Date(data_fim),
        preco: preco ? parseFloat(preco) : 0.0,
        vagas_disponiveis: vagas_disponiveis ? parseInt(vagas_disponiveis, 10) : null,
        ativa: ativa ?? true,
        missao_anterior_id: missao_anterior_id ? parseInt(missao_anterior_id, 10) : null,
      },
    });
    res.status(201).json({ message: 'Missão criada com sucesso!', mission: serializeMission(mission) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(400).json({ error: 'missao_anterior_id inválido.' });
    }
    console.error('Erro ao criar missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getAllMissions = async (req, res) => {
  try {
    const missions = await prisma.missao.findMany({
      orderBy: { data_inicio: 'desc' },
      include: {
        tarefas: {
          where: { ativa: true },
          orderBy: { ordem: 'asc' },
          include: { categoria: true },
        },
      },
    });
    res.json(missions.map(serializeMission));
  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getMissionById = async (req, res) => {
  const id = parseInt(req.params.missionId, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const mission = await prisma.missao.findUnique({
      where: { id },
      include: {
        tarefas: {
          where: { ativa: true },
          orderBy: { ordem: 'asc' },
          include: { categoria: true },
        },
      },
    });
    if (!mission) return res.status(404).json({ error: 'Missão não encontrada.' });
    res.json(serializeMission(mission));
  } catch (error) {
    console.error('Erro ao buscar missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const updateMission = async (req, res) => {
  const id = parseInt(req.params.missionId, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  const { titulo, descricao, destino, data_inicio, data_fim, preco, vagas_disponiveis, ativa, missao_anterior_id, foto_url } = req.body;

  const data = {
    ...(titulo !== undefined && { titulo }),
    ...(descricao !== undefined && { descricao }),
    ...(destino !== undefined && { destino }),
    ...(foto_url !== undefined && { foto_url }),
    ...(ativa !== undefined && { ativa }),
    ...(data_inicio && !isNaN(new Date(data_inicio)) && { data_inicio: new Date(data_inicio) }),
    ...(data_fim && !isNaN(new Date(data_fim)) && { data_fim: new Date(data_fim) }),
    ...(preco !== undefined && !isNaN(parseFloat(preco)) && { preco: parseFloat(preco) }),
    ...(vagas_disponiveis !== undefined && { vagas_disponiveis: vagas_disponiveis ? parseInt(vagas_disponiveis, 10) : null }),
    ...(missao_anterior_id !== undefined && { missao_anterior_id: missao_anterior_id ? parseInt(missao_anterior_id, 10) : null }),
  };

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo válido para atualizar.' });
  }

  try {
    const mission = await prisma.missao.update({ where: { id }, data });
    res.json({ message: 'Missão atualizada com sucesso!', mission: serializeMission(mission) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Missão não encontrada.' });
      if (error.code === 'P2003') return res.status(400).json({ error: 'missao_anterior_id inválido.' });
    }
    console.error('Erro ao atualizar missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const softDeleteMission = async (req, res) => {
  const id = parseInt(req.params.missionId, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const mission = await prisma.missao.update({ where: { id }, data: { ativa: false } });
    res.json({ message: 'Missão desativada com sucesso!', mission: serializeMission(mission) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }
    console.error('Erro ao desativar missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { createMission, getAllMissions, getMissionById, updateMission, softDeleteMission };