const db = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * @route   GET /api/admin/users
 * @desc    (Admin) Listar todos os usuários (com filtros)
 * @query   ?ativo=true&perfil=user&busca=samuel
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
  const { ativo, perfil, busca } = req.query;

  let baseQuery = 'SELECT id, nome, email, empresa, role, ativo, pontos, foto_url FROM usuarios';
  const conditions = [];
  const params = [];
  let counter = 1;

  if (ativo) {
    conditions.push(`ativo = $${counter++}`);
    params.push(ativo === 'true');
  }
  if (perfil) {
    conditions.push(`role = $${counter++}`);
    params.push(perfil);
  }
  if (busca) {
    // Busca por nome ou email
    conditions.push(`(nome ILIKE $${counter} OR email ILIKE $${counter})`);
    params.push(`%${busca}%`);
    counter++;
  }

  if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }

  baseQuery += ' ORDER BY nome ASC';

  try {
    const { rows } = await db.query(baseQuery, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   POST /api/admin/users
 * @desc    (Admin) Criar um novo usuário manualmente
 * @access  Admin
 */
const createUser = async (req, res) => {
  const { nome, email, senha, empresa, role, ativo } = req.body;

  if (!nome || !email || !senha || !role) {
    return res.status(400).json({ error: 'Nome, email, senha e role são obrigatórios.' });
  }

  try {
    // Verificar se e-mail já existe
    const emailCheck = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const query = `
      INSERT INTO usuarios (nome, email, senha, empresa, role, ativo, data_criacao, data_atualizacao)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, nome, email, empresa, role, ativo;
    `;
    const values = [nome, email, senhaHash, empresa || null, role, ativo || true];
    
    const { rows } = await db.query(query, values);
    res.status(201).json({ message: 'Usuário criado pelo admin com sucesso!', user: rows[0] });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/users/:id
 * @desc    (Admin) Buscar um usuário específico
 * @access  Admin
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT id, nome, email, empresa, role, ativo, pontos, foto_url FROM usuarios WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PATCH /api/admin/users/:id
 * @desc    (Admin) Atualizar dados de um usuário (mudar role, status, etc.)
 * @access  Admin
 */
const updateUser = async (req, res) => {
  const { id } = req.params;
  // Campos que o admin pode atualizar
  const { nome, email, foto_url, role, ativo, pontos, empresa } = req.body;

  try {
    // Usamos COALESCE para atualizar apenas os campos enviados, mantendo os
    // valores antigos para os campos que vieram como nulos (undefined)
    const updateQuery = `
      UPDATE usuarios
      SET
        nome = COALESCE($1, nome),
        email = COALESCE($2, email),
        foto_url = COALESCE($3, foto_url),
        role = COALESCE($4, role),
        ativo = COALESCE($5, ativo),
        pontos = COALESCE($6, pontos),
        empresa = COALESCE($7, empresa),
        data_atualizacao = NOW()
      WHERE id = $8
      RETURNING id, nome, email, empresa, role, ativo, pontos, foto_url;
    `;
    const values = [
      nome, email, foto_url, role, ativo, pontos, empresa, id
    ];
    
    const { rows } = await db.query(updateQuery, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado para atualizar.' });
    }
    res.json({ message: 'Usuário atualizado com sucesso!', user: rows[0] });

  } catch (error) {
    // Erro de e-mail duplicado
    if (error.code === '23505') { 
      return res.status(409).json({ error: 'Este e-mail já está em uso por outro usuário.' });
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    (Admin) Desativar um usuário (Soft Delete)
 * @access  Admin
 */
const deleteUser = async (req, res) => {
  // Vamos fazer um soft delete (apenas desativar) para manter
  // a integridade dos logs, submissões e pontos.
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'UPDATE usuarios SET ativo = false, data_atualizacao = NOW() WHERE id = $1 RETURNING id, ativo;',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado para deletar.' });
    }
    res.json({ message: 'Usuário desativado (soft delete) com sucesso!', user: rows[0] });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};