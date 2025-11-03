<<<<<<< HEAD
const db = require('../config/db');
=======
// Importa o Prisma Client
const prisma = require('../config/prismaClient');

>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado
 * @access  Privado
 */
const updateMyProfile = async (req, res) => {
  const userId = req.user.id;
<<<<<<< HEAD
  const { nome, foto_url } = req.body; 
  const { curiosidades, linkedin_url, website, interesses, data_nascimento, telefone } = req.body;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    // 1. Atualizar 'usuarios'
    const updateUserQuery = `
      UPDATE usuarios SET nome = COALESCE($1, nome), foto_url = COALESCE($2, foto_url),
        data_atualizacao = NOW()
      WHERE id = $3 RETURNING nome, foto_url;
    `;
    await client.query(updateUserQuery, [nome, foto_url, userId]);
    // 2. "UPSERT" 'perfis'
    const upsertProfileQuery = `
      INSERT INTO perfis (usuario_id, curiosidades, linkedin_url, website, interesses, data_nascimento, telefone, data_criacao, data_atualizacao)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (usuario_id) DO UPDATE SET
        curiosidades = COALESCE($2, perfis.curiosidades),
        linkedin_url = COALESCE($3, perfis.linkedin_url),
        website = COALESCE($4, perfis.website),
        interesses = COALESCE($5, perfis.interesses),
        data_nascimento = COALESCE($6, perfis.data_nascimento),
        telefone = COALESCE($7, perfis.telefone),
        data_atualizacao = NOW();
    `;
    await client.query(upsertProfileQuery, [userId, curiosidades, linkedin_url, website, interesses, data_nascimento, telefone]);
    await client.query('COMMIT');
    res.json({ message: 'Perfil atualizado com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    client.release();
=======
  
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
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
  }
};

/**
 * @route   GET /api/users/:id/profile
 * @desc    Busca o perfil público de um usuário específico
 * @access  Privado (requer login)
 */
const getUserProfileById = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params; // ID do usuário que queremos ver

    const query = `
      SELECT
        u.id,
        u.nome,
        u.foto_url,
        u.pontos,
        p.curiosidades,
        p.linkedin_url,
        p.website,
        p.interesses
      FROM usuarios u
      LEFT JOIN perfis p ON u.id = p.usuario_id
      WHERE u.id = $1 AND u.ativo = true AND u.role = 'user'
    `;
    
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de usuário não encontrado ou inativo.' });
    }

    // Retorna apenas dados públicos. 
    // Note que não incluímos email, telefone, data_nascimento, etc.
    res.json(rows[0]);
=======
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
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

  } catch (error) {
    console.error('Erro ao buscar perfil público:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  updateMyProfile,
<<<<<<< HEAD
=======
  getUserProfileById, // Corrigido para exportar ambas as funções
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
};