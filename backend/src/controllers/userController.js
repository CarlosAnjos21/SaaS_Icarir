// Importa o Prisma Client
const prisma = require("../config/prismaClient");

/**
 * @route   GET /api/users/me
 * @desc    Retorna os dados do usuário logado
 * @access  Privado
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.usuarios.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        pontos: true,
        foto_url: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário logado:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado
 * @access  Privado
 */
const updateMyProfile = async (req, res) => {
  const userId = req.user.id;
<<<<<<< HEAD
  
=======

>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
  // Dados da tabela 'usuarios'
  const { nome, foto_url } = req.body;

  // Dados da tabela 'perfis'
  const {
    curiosidades,
    linkedin_url,
    website,
    interesses,
    data_nascimento,
    telefone,
  } = req.body;

  // Dados preparados para o upsert do perfil
  const profileData = {
    curiosidades,
    linkedin_url,
    website,
    interesses,
    data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
    telefone,
  };

  try {
    // Transação garante consistência entre as tabelas 'usuarios' e 'perfis'
    await prisma.$transaction([
      // Atualiza o usuário
      prisma.usuarios.update({
        where: { id: userId },
        data: {
          nome,
          foto_url,
          data_atualizacao: new Date(),
        },
      }),

      // Cria ou atualiza o perfil (UPSERT)
      prisma.perfis.upsert({
        where: { usuario_id: userId },
        update: {
          ...profileData,
          data_atualizacao: new Date(),
        },
        create: {
          ...profileData,
          usuario_id: userId,
          data_criacao: new Date(),
          data_atualizacao: new Date(),
        },
      }),
    ]);

    res.json({ message: "Perfil atualizado com sucesso!" });
  } catch (error) {
<<<<<<< HEAD
    // O Prisma gerencia o ROLLBACK automaticamente em caso de erro
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
=======
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
  }
};

/**
 * @route   GET /api/users/:id/profile
 * @desc    Busca o perfil público de um usuário específico
 * @access  Privado (requer login)
 */
const getUserProfileById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuário inválido." });
    }

    // Busca o usuário e inclui dados do perfil (substitui o LEFT JOIN)
    const user = await prisma.usuarios.findFirst({
      where: {
        id: userId,
        ativo: true,
        role: "user",
      },
      select: {
        id: true,
        nome: true,
        foto_url: true,
        pontos: true,
        perfil: {
          select: {
            curiosidades: true,
            linkedin_url: true,
            website: true,
            interesses: true,
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Perfil de usuário não encontrado ou inativo." });
    }

    // Achata o objeto para manter o mesmo formato da resposta SQL anterior
    const { perfil, ...usuarioBase } = user;
    const response = {
      ...usuarioBase,
      ...(perfil || {}),
    };
<<<<<<< HEAD
    
    res.json(response);
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar perfil público:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

module.exports = {
  updateMyProfile,
<<<<<<< HEAD
  getUserProfileById, // Corrigido para exportar ambas as funções
};
=======
  getUserProfileById,
  getMyProfile, // 👈 novo export
};
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
