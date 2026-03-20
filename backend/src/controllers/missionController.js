const prisma = require('../config/prismaClient');

const getAllActiveMissions = async (req, res) => {
  try {
    const userId = req.user?.id;

    const missoes = await prisma.missao.findMany({
      where: { ativa: true },
      select: {
        id: true, titulo: true, descricao: true, destino: true,
        foto_url: true, data_inicio: true, data_fim: true,
        preco: true, vagas_disponiveis: true,
      },
      orderBy: { data_inicio: 'asc' },
    });

    const missionIds = missoes.map((m) => m.id);

    const [inscricoes, taskSums, userTaskPoints] = await Promise.all([
      userId
        ? prisma.usuarioMissao.findMany({ where: { usuario_id: userId }, select: { missao_id: true } })
        : Promise.resolve([]),
      prisma.tarefa.groupBy({
        by: ['missao_id'],
        where: { missao_id: { in: missionIds }, ativa: true },
        _sum: { pontos: true },
      }),
      userId && missionIds.length
        ? prisma.usuarioTarefa.findMany({
            where: { usuario_id: userId, tarefa: { missao_id: { in: missionIds } } },
            select: { pontos_obtidos: true, tarefa: { select: { missao_id: true } } },
          })
        : Promise.resolve([]),
    ]);

    const joinedIds = new Set(inscricoes.map((i) => i.missao_id));
    const totalPointsMap = Object.fromEntries(taskSums.map((s) => [s.missao_id, s._sum.pontos || 0]));
    const userPointsMap = {};
    userTaskPoints.forEach((u) => {
      const mid = u.tarefa.missao_id;
      userPointsMap[mid] = (userPointsMap[mid] || 0) + (u.pontos_obtidos || 0);
    });

    const formatted = missoes.map((m) => ({
      ...m,
      preco: m.preco ? Number(m.preco) : 0,
      isJoined: joinedIds.has(m.id),
      totalPoints: totalPointsMap[m.id] || 0,
      userPoints: userPointsMap[m.id] || 0,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getMissionById = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const [missao, pointsAgg] = await Promise.all([
      prisma.missao.findUnique({ where: { id: missionId } }),
      prisma.tarefa.aggregate({
        where: { missao_id: missionId, ativa: true },
        _sum: { pontos: true },
      }),
    ]);

    if (!missao) return res.status(404).json({ error: 'Missão não encontrada.' });

    res.json({
      ...missao,
      preco: missao.preco ? Number(missao.preco) : 0,
      totalPoints: pointsAgg._sum.pontos ? Number(pointsAgg._sum.pontos) : 0,
    });
  } catch (error) {
    console.error('Erro ao buscar missão:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

const getMissionFullById = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const userId = req.user?.id;
  if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const missao = await prisma.missao.findUnique({
      where: { id: missionId },
      include: {
        tarefas: {
          where: { ativa: true },
          orderBy: { ordem: 'asc' },
          include: {
            categoria: true,
            quiz: { include: { perguntas: { orderBy: { ordem: 'asc' } } } },
          },
        },
        _count: { select: { usuarios: true, tarefas: true } },
      },
    });

    if (!missao) return res.status(404).json({ error: 'Missão não encontrada.' });

    // Normaliza requisitos que vieram como string
    const tarefas = missao.tarefas.map((t) => ({
      ...t,
      requisitos: typeof t.requisitos === 'string' ? (() => { try { return JSON.parse(t.requisitos); } catch { return t.requisitos; } })() : t.requisitos,
    }));

    const [inscricao, progressoUsuario] = await Promise.all([
      prisma.usuarioMissao.findUnique({
        where: { usuario_id_missao_id: { usuario_id: userId, missao_id: missionId } },
      }),
      prisma.usuarioTarefa.findMany({
        where: { usuario_id: userId, tarefa_id: { in: tarefas.map((t) => t.id) } },
        select: { tarefa_id: true, concluida: true, pontos_obtidos: true, validado_por: true },
      }),
    ]);

    const topRankingRaw = await prisma.usuarioTarefa.groupBy({
      by: ['usuario_id'],
      where: { tarefa: { missao_id: missionId }, concluida: true },
      _sum: { pontos_obtidos: true },
      orderBy: { _sum: { pontos_obtidos: 'desc' } },
      take: 5,
    });

    const usersInfo = await prisma.usuario.findMany({
      where: { id: { in: topRankingRaw.map((r) => r.usuario_id) } },
      select: { id: true, nome: true, foto_url: true },
    });

    const ranking = topRankingRaw.map((r) => {
      const u = usersInfo.find((x) => x.id === r.usuario_id);
      return {
        id: r.usuario_id,
        name: u?.nome || 'Usuário',
        avatar: u?.foto_url || null,
        points: r._sum.pontos_obtidos || 0,
        isCurrentUser: r.usuario_id === userId,
      };
    });

    const missionTotalPoints = tarefas.reduce((acc, t) => acc + Number(t.pontos || 0), 0);
    const myPoints = progressoUsuario.reduce((acc, p) => acc + (p.pontos_obtidos || 0), 0);

    res.json({
      ...missao,
      tarefas,
      preco: missao.preco ? Number(missao.preco) : 0,
      isJoined: !!inscricao,
      participationStatus: inscricao?.status_participacao || null,
      totalPoints: missionTotalPoints,
      userProgress: {
        totalPoints: myPoints,
        completedTasksCount: progressoUsuario.filter((p) => p.concluida).length,
        tasksStatus: Object.fromEntries(
          progressoUsuario.map((p) => [p.tarefa_id, { concluida: p.concluida, validado: !!p.validado_por }])
        ),
      },
      ranking,
    });
  } catch (error) {
    console.error('Erro ao buscar missão completa:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

const joinMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const userId = req.user.id;
  if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const mission = await tx.missao.findUnique({ where: { id: missionId } });
      if (!mission?.ativa) throw Object.assign(new Error('Missão indisponível.'), { status: 400 });

      const exists = await tx.usuarioMissao.findUnique({
        where: { usuario_id_missao_id: { usuario_id: userId, missao_id: missionId } },
      });
      if (exists) throw Object.assign(new Error('Você já está inscrito nesta missão.'), { status: 409 });

      return tx.usuarioMissao.create({
        data: {
          usuario_id: userId,
          missao_id: missionId,
          valor_pago: mission.preco || 0,
          status_pagamento: Number(mission.preco) > 0 ? 'pendente' : 'pago',
          status_participacao: 'inscrito',
        },
      });
    });

    res.json({ message: 'Inscrição realizada!', subscription: result });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Erro ao inscrever.' });
  }
};

const leaveMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const userId = req.user.id;
  if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const exists = await prisma.usuarioMissao.findUnique({
      where: { usuario_id_missao_id: { usuario_id: userId, missao_id: missionId } },
    });
    if (!exists) return res.status(404).json({ error: 'Você não está inscrito nesta missão.' });

    await prisma.$transaction([
      prisma.usuarioMissao.delete({
        where: { usuario_id_missao_id: { usuario_id: userId, missao_id: missionId } },
      }),
      prisma.usuarioTarefa.deleteMany({
        where: { usuario_id: userId, tarefa: { missao_id: missionId } },
      }),
    ]);

    res.json({ message: 'Inscrição cancelada. Seu progresso foi zerado.' });
  } catch (error) {
    console.error('Erro ao sair da missão:', error);
    res.status(500).json({ error: 'Erro ao cancelar inscrição.' });
  }
};

const getMissionParticipants = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const participants = await prisma.usuarioMissao.findMany({
      where: { missao_id: missionId },
      include: { usuario: { select: { id: true, nome: true, email: true, foto_url: true } } },
      orderBy: { data_compra: 'desc' },
    });

    res.json(participants.map((p) => ({
      id: p.id,
      userId: p.usuario.id,
      name: p.usuario.nome,
      email: p.usuario.email,
      avatar: p.usuario.foto_url,
      status: p.status_participacao,
      paymentStatus: p.status_pagamento,
      date: p.data_compra,
    })));
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
    res.status(500).json({ error: 'Erro ao buscar participantes.' });
  }
};

const addParticipantToMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const userId = parseInt(req.body.userId, 10);
  if (isNaN(missionId) || isNaN(userId)) return res.status(400).json({ error: 'Dados inválidos.' });

  try {
    const sub = await prisma.usuarioMissao.create({
      data: { usuario_id: userId, missao_id: missionId, status_participacao: 'confirmado', status_pagamento: 'pago', valor_pago: 0 },
    });
    res.json(sub);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Usuário já inscrito.' });
    console.error('Erro ao adicionar participante:', error);
    res.status(500).json({ error: 'Erro ao adicionar participante.' });
  }
};

const removeParticipantFromMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(missionId) || isNaN(userId)) return res.status(400).json({ error: 'IDs inválidos.' });

  try {
    await prisma.usuarioMissao.delete({
      where: { usuario_id_missao_id: { usuario_id: userId, missao_id: missionId } },
    });
    res.json({ message: 'Participante removido.' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Inscrição não encontrada.' });
    console.error('Erro ao remover participante:', error);
    res.status(500).json({ error: 'Erro ao remover participante.' });
  }
};

module.exports = {
  getAllActiveMissions, getMissionById, getMissionFullById,
  joinMission, leaveMission,
  getMissionParticipants, addParticipantToMission, removeParticipantFromMission,
};