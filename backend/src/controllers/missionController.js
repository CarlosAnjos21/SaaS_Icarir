// Importa o Prisma Client de forma segura
const prismaModule = require("../config/prismaClient");
const prisma = prismaModule.prisma || prismaModule.default || prismaModule;
const { Prisma } = require('@prisma/client'); 

/**
 * @route   GET /api/missions
 * @desc    Listar todas as missões ativas (Com status de inscrição do usuário)
 * @access  Privado (requer token)
 */
const getAllActiveMissions = async (req, res) => {
  try {
    const userId = req.user?.id; // Pega o ID do usuário logado

    const missoes = await prisma.missao.findMany({
      where: { ativa: true },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        destino: true,
        data_inicio: true,
        data_fim: true,
        preco: true,
        vagas_disponiveis: true,
        foto_url: true 
      },
      orderBy: { data_inicio: 'asc' }
    });

    // Busca quais dessas missões o usuário já está inscrito
    let joinedMissionIds = [];
    if (userId) {
        const inscricoes = await prisma.usuarioMissao.findMany({
            where: { usuario_id: userId },
            select: { missao_id: true }
        });
        joinedMissionIds = inscricoes.map(i => i.missao_id);
    }
    
    // Formata e adiciona a flag 'isJoined'
    const formatted = missoes.map(m => ({
        ...m,
        preco: m.preco ? Number(m.preco) : 0,
        isJoined: joinedMissionIds.includes(m.id) // True se o ID estiver na lista de inscrições
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/missions/:missionId
 * @desc    Buscar detalhes de uma missão específica
 * @access  Privado (requer token)
 */
const getMissionById = async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

    const missao = await prisma.missao.findUnique({
      where: { id: missionId }
    });

    if (!missao) return res.status(404).json({ error: 'Missão não encontrada.' });
    
    res.json(missao);
  } catch (error) {
    console.error('Erro ao buscar missão:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

/**
 * @route   GET /api/missions/:missionId/full
 * @desc    Dados completos da missão + Contexto do Usuário (Inscrição, Progresso)
 * @access  Privado
 */
const getMissionFullById = async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId, 10);
    const userId = req.user?.id; 

    if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

    // 1. Busca dados da missão e tarefas
    const missao = await prisma.missao.findUnique({
      where: { id: missionId },
      include: {
        tarefas: {
          where: { ativa: true },
          orderBy: { ordem: 'asc' },
          include: {
            categoria: true,
            quiz: { select: { id: true, titulo: true } } 
          }
        },
        _count: { select: { usuarios: true, tarefas: true } }
      }
    });

    if (!missao) return res.status(404).json({ error: 'Missão não encontrada.' });

    // 2. Busca contexto do usuário (Verificação rigorosa)
    const inscricao = await prisma.usuarioMissao.findUnique({
      where: {
        usuario_id_missao_id: {
          usuario_id: userId,
          missao_id: missionId
        }
      }
    });

    let progressoUsuario = [];
    if (inscricao) {
      // Se inscrito, busca o status de cada tarefa
      progressoUsuario = await prisma.usuarioTarefa.findMany({
        where: {
          usuario_id: userId,
          tarefa_id: { in: missao.tarefas.map(t => t.id) }
        },
        select: {
          tarefa_id: true,
          concluida: true,
          pontos_obtidos: true,
          validado_por: true
        }
      });
    }

    // 3. Calcula Ranking (Top 5)
    const topRankingRaw = await prisma.usuarioTarefa.groupBy({
      by: ['usuario_id'],
      where: {
        tarefa: { missao_id: missionId },
        concluida: true
      },
      _sum: { pontos_obtidos: true },
      orderBy: { _sum: { pontos_obtidos: 'desc' } },
      take: 5
    });

    const rankingIds = topRankingRaw.map(r => r.usuario_id);
    const usersInfo = await prisma.usuario.findMany({
      where: { id: { in: rankingIds } },
      select: { id: true, nome: true, foto_url: true }
    });

    const ranking = topRankingRaw.map(r => {
      const u = usersInfo.find(user => user.id === r.usuario_id);
      return {
        id: r.usuario_id,
        name: u ? u.nome : 'Usuário',
        avatar: u ? u.foto_url : null,
        points: r._sum.pontos_obtidos || 0,
        isCurrentUser: r.usuario_id === userId
      };
    });

    const myPoints = progressoUsuario.reduce((acc, curr) => acc + (curr.pontos_obtidos || 0), 0);
    
    // 4. Monta resposta estruturada
    const response = {
      ...missao,
      preco: missao.preco ? Number(missao.preco) : 0,
      isJoined: !!inscricao, // Boolean seguro
      participationStatus: inscricao ? inscricao.status_participacao : null,
      userProgress: {
        totalPoints: myPoints,
        completedTasksCount: progressoUsuario.filter(p => p.concluida).length,
        tasksStatus: progressoUsuario.reduce((acc, curr) => {
          acc[curr.tarefa_id] = { concluida: curr.concluida, validado: !!curr.validado_por };
          return acc;
        }, {})
      },
      ranking
    };

    res.json(response);

  } catch (error) {
    console.error('Erro ao buscar dados completos:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

/**
 * @route   POST /api/missions/:missionId/join
 * @desc    Inscrever usuário na missão
 */
const joinMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const userId = req.user.id;

  if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const mission = await tx.missao.findUnique({ where: { id: missionId } });
      if (!mission || !mission.ativa) throw new Error('Missão indisponível.');

      const exists = await tx.usuarioMissao.findUnique({
        where: { usuario_id_missao_id: { usuario_id: userId, missao_id: missionId } }
      });
      if (exists) throw new Error('Já inscrito.');

      return await tx.usuarioMissao.create({
        data: {
          usuario_id: userId,
          missao_id: missionId,
          valor_pago: mission.preco || 0,
          status_pagamento: Number(mission.preco) > 0 ? 'pendente' : 'pago',
          status_participacao: 'inscrito'
        }
      });
    });

    res.json({ message: 'Inscrição realizada!', subscription: result });

  } catch (error) {
    const status = error.message === 'Já inscrito.' ? 409 : 400;
    res.status(status).json({ error: error.message || 'Erro ao inscrever.' });
  }
};

/**
 * @route   DELETE /api/missions/:missionId/join
 * @desc    Cancelar inscrição (Sair da missão)
 */
const leaveMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const userId = req.user.id;

  if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    // Verifica se a inscrição existe
    const exists = await prisma.usuarioMissao.findUnique({
        where: { usuario_id_missao_id: { usuario_id: userId, missao_id: missionId } }
    });

    if (!exists) {
        return res.status(404).json({ error: 'Você não está inscrito nesta missão.' });
    }

    // Remove a inscrição
    await prisma.usuarioMissao.delete({
        where: { usuario_id_missao_id: { usuario_id: userId, missao_id: missionId } }
    });

    // Opcional: Se quiser limpar o progresso das tarefas ao sair, descomente abaixo
    // await prisma.usuarioTarefa.deleteMany({
    //    where: { usuario_id: userId, tarefa: { missao_id: missionId } }
    // });

    res.json({ message: 'Inscrição cancelada com sucesso.' });

  } catch (error) {
    console.error('Erro ao sair da missão:', error);
    res.status(500).json({ error: 'Erro ao cancelar inscrição.' });
  }
};

// Funções administrativas (mantidas)
const getMissionParticipants = async (req, res) => {
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

    try {
        const participants = await prisma.usuarioMissao.findMany({
            where: { missao_id: missionId },
            include: {
                usuario: {
                    select: { id: true, nome: true, email: true, foto_url: true }
                }
            },
            orderBy: { data_compra: 'desc' }
        });
        
        const formatted = participants.map(p => ({
            id: p.id,
            userId: p.usuario.id,
            name: p.usuario.nome,
            email: p.usuario.email,
            avatar: p.usuario.foto_url,
            status: p.status_participacao,
            paymentStatus: p.status_pagamento,
            date: p.data_compra
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Erro ao buscar participantes:', error);
        res.status(500).json({ error: 'Erro ao buscar participantes.' });
    }
};

const addParticipantToMission = async (req, res) => {
    const missionId = parseInt(req.params.missionId, 10);
    const { userId } = req.body;

    if (isNaN(missionId) || !userId) return res.status(400).json({ error: 'Dados incompletos.' });

    try {
        const newSub = await prisma.usuarioMissao.create({
            data: {
                usuario_id: parseInt(userId),
                missao_id: missionId,
                status_participacao: 'confirmado',
                status_pagamento: 'pago',
                valor_pago: 0
            }
        });
        res.json(newSub);
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
            where: {
                usuario_id_missao_id: {
                    usuario_id: userId,
                    missao_id: missionId
                }
            }
        });
        res.json({ message: 'Participante removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao remover participante:', error);
        res.status(500).json({ error: 'Erro ao remover participante.' });
    }
};

module.exports = {
  getAllActiveMissions,
  getMissionById,
  getMissionFullById,
  joinMission,
  leaveMission, // Nova função exportada
  getMissionParticipants,
  addParticipantToMission,
  removeParticipantFromMission
};