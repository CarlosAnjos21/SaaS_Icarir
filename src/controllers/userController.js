const db = require('../config/db');

// Controller para buscar os dados do usuário logado
const getMyProfile = async (req, res) => {
  try {
    // Graças ao authMiddleware, temos 'req.user' com o ID do usuário
    const userId = req.user.id;

    // Busca o usuário no banco, mas NÃO retorna a senha
    const query = `
      SELECT
        u.id, u.nome, u.email, u.empresa, u.role, u.pontos, u.foto_url,
        p.curiosidades, p.linkedin_url, p.website, p.interesses, p.data_nascimento, p.telefone
      FROM usuarios u
      LEFT JOIN perfis p ON u.id = p.usuario_id
      WHERE u.id = $1
    `;
    
    const { rows } = await db.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado
 * @access  Privado
 */
const updateMyProfile = async (req, res) => {
  const userId = req.user.id;
  
  // Dados da tabela 'usuarios' 
  const { nome, foto_url } = req.body; 
  
  // Dados da tabela 'perfis' [cite: 32, 33, 39, 41]
  const { 
    curiosidades, 
    linkedin_url, 
    website, 
    interesses, 
    data_nascimento, 
    telefone 
  } = req.body;

  const client = await db.pool.connect();

  try {
    // INICIAR TRANSAÇÃO
    await client.query('BEGIN');

    // 1. Atualizar a tabela 'usuarios'
    // COALESCE mantém o valor antigo se o novo for nulo
    const updateUserQuery = `
      UPDATE usuarios
      SET
        nome = COALESCE($1, nome),
        foto_url = COALESCE($2, foto_url),
        data_atualizacao = NOW()
      WHERE id = $3
      RETURNING nome, foto_url;
    `;
    await client.query(updateUserQuery, [nome, foto_url, userId]);

    // 2. Usar "UPSERT" (INSERT ... ON CONFLICT) para a tabela 'perfis'
    // Isso cria o perfil se não existir, ou atualiza se já existir.
    const upsertProfileQuery = `
      INSERT INTO perfis (
        usuario_id, curiosidades, linkedin_url, website, interesses, data_nascimento, telefone, data_criacao, data_atualizacao
      )
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
    await client.query(upsertProfileQuery, [
      userId, 
      curiosidades, 
      linkedin_url, 
      website, 
      interesses, 
      data_nascimento, 
      telefone
    ]);

    // COMMIT
    await client.query('COMMIT');
    
    res.json({ message: 'Perfil atualizado com sucesso!' });

  } catch (error) {
    // ROLLBACK
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
};


module.exports = {
  getMyProfile,
  updateMyProfile, // <<< Adiciona a nova função
};