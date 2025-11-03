// Importa o Prisma Client
const prisma = require('../config/prismaClient');

/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado
 * @access  Privado
 */
const updateMyProfile = async (req, res) => {
  const userId = req.user.id;
  
  // Dados da tabela 'usuarios'
  const { nome, foto_url } = req.body; 
  
  // Dados da tabela 'perfis'
  const { 
    curiosidades, 
    linkedin_url, 
    website, 
    interesses, 
    data_nascimento, 
    telefone 
  } = req.body;

  // Objeto de dados para o perfil
  const profileData = {
    curiosidades,
    linkedin_url,
    website,
    interesses,
    data_nascimento: data_nascimento ? new Date(data_nascimento) : null, // Garante que a data esteja no formato correto
    telefone
  };

  try {
    // Usamos $transaction para garantir que ambas as operações
    // (atualizar usuário e atualizar/criar perfil) aconteçam com sucesso.
    const [updatedUser, updatedProfile] = await prisma.$transaction([
      
      // 1. Atualizar a tabela 'usuarios'
      prisma.usuarios.update({
        where: { id: userId },
        data: {
          nome: nome,
          foto_url: foto_url,
        }
      }),

      // 2. Usar "UPSERT" para a tabela 'perfis'
      // (Atualiza se existir, cria se não existir)
      prisma.perfis.upsert({
        where: { usuario_id: userId },
        update: profileData,
        create: {
          ...profileData,
          usuario_id: userId // Vincula ao usuário na criação
        }
      })
    ]);

    res.json({ message: 'Perfil atualizado com sucesso!' });

  } catch (error) {
    // O Prisma gerencia o ROLLBACK automaticamente em caso de erro
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
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
      return res.status(400).json({ error: 'ID de usuário inválido.' });
    }

    // Busca o usuário e inclui dados do perfil (substitui o LEFT JOIN)
    const user = await prisma.usuarios.findFirst({
      where: { 
        id: userId,
        ativo: true,
        role: 'user'
      },
      // Selecionamos exatamente os campos que queremos
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
            interesses: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Perfil de usuário não encontrado ou inativo.' });
    }

    // Achata o objeto para que a resposta da API seja a mesma do SQL (sem aninhamento)
    // O Prisma retorna: { id, nome, ..., perfil: { curiosidades, ... } }
    // Queremos: { id, nome, ..., curiosidades, ... }
    const { perfil, ...usuarioBase } = user;
    const response = {
      ...usuarioBase,
      ...(perfil || {}) // Mescla o perfil (ou um objeto vazio se não houver)
    };
    
    res.json(response);

  } catch (error) {
    console.error('Erro ao buscar perfil público:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  updateMyProfile,
  getUserProfileById, // Corrigido para exportar ambas as funções
};