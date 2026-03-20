const prisma = require('../config/prismaClient');

// Pendentes = evidências enviadas (tentativas > 0) mas ainda não validadas (concluida: false, validado_por: null)
const getPendingValidations = async (req, res) => {
  const { tarefa_id, usuario_id, page = 1, limit = 50 } = req.query;

  const where = {
    concluida: false,      // ainda não aprovada
    validado_por: null,    // ainda não foi analisada por ninguém
    tentativas: { gt: 0 }, // mas tem evidências enviadas
    ...(tarefa_id && { tarefa_id: parseInt(tarefa_id, 10) }),
    ...(usuario_id && { usuario_id: parseInt(usuario_id, 10) }),
  };

  const take = Math.min(parseInt(limit, 10) || 50, 200);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  try {
    const [pending, total] = await Promise.all([
      prisma.usuarioTarefa.findMany({
        where,
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
          tarefa: { select: { id: true, titulo: true } },
        },
        orderBy: { data_criacao: 'desc' },
        skip,
        take,
      }),
      prisma.usuarioTarefa.count({ where }),
    ]);

    res.json({ data: pending, meta: { total, page: parseInt(page, 10), limit: take } });
  } catch (error) {
    console.error('Erro ao listar validações pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { getPendingValidations };