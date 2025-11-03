<<<<<<< HEAD
const db = require('../config/db');
=======
// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para tratamento de erro
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
const bcrypt = require('bcryptjs');

/**
 * @route   GET /api/admin/users
 * @desc    (Admin) Listar todos os usuários (com filtros)
 * @query   ?ativo=true&perfil=user&busca=samuel
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
  const { ativo, perfil, busca } = req.query;

<<<<<<< HEAD
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
=======
  // Objeto 'where' dinâmico do Prisma
  let where = {};

  if (ativo) {
    where.ativo = (ativo === 'true');
  }
  if (perfil) {
    where.role = perfil;
  }
  if (busca) {
    // Substitui (nome ILIKE ... OR email ILIKE ...)
    where.OR = [
      { nome: { contains: busca, mode: 'insensitive' } },
      { email: { contains: busca, mode: 'insensitive' } }
    ];
  }

  try {
    const users = await prisma.usuarios.findMany({
      where: where,
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true,
        pontos: true,
        foto_url: true
      },
      orderBy: {
        nome: 'asc'
      }
    });
    res.json(users);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
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
<<<<<<< HEAD
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
=======
    // 1. Verificar se e-mail já existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { email: email }
    });
    if (existingUser) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // 2. Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 3. Criar usuário
    const newUser = await prisma.usuarios.create({
      data: {
        nome: nome,
        email: email,
        senha: senhaHash,
        empresa: empresa || null,
        role: role,
        ativo: ativo || true
      },
      // 4. Selecionar campos de retorno (igual ao RETURNING)
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true
      }
    });
    
    res.status(201).json({ message: 'Usuário criado pelo admin com sucesso!', user: newUser });

  } catch (error) {
    // Trata erro de e-mail duplicado (race condition)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
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
<<<<<<< HEAD
    const { id } = req.params;
    const { rows } = await db.query('SELECT id, nome, email, empresa, role, ativo, pontos, foto_url FROM usuarios WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(rows[0]);
=======
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de usuário inválido.' });
    }

    const user = await prisma.usuarios.findUnique({
      where: { id: id },
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true,
        pontos: true,
        foto_url: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(user);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
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
<<<<<<< HEAD
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
=======
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de usuário inválido.' });
    }
    
    // Campos que o admin pode atualizar
    const { nome, email, foto_url, role, ativo, pontos, empresa } = req.body;

    // Prisma ignora campos 'undefined', substituindo a lógica do COALESCE
    const updatedUser = await prisma.usuarios.update({
      where: { id: id },
      data: {
        nome: nome,
        email: email,
        foto_url: foto_url,
        role: role,
        ativo: ativo,
        pontos: pontos,
        empresa: empresa
      },
      // Seleciona os campos de retorno (igual ao RETURNING)
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true,
        pontos: true,
        foto_url: true
      }
    });
    
    res.json({ message: 'Usuário atualizado com sucesso!', user: updatedUser });

  } catch (error) {
    // Erro de e-mail duplicado
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') { 
      return res.status(409).json({ error: 'Este e-mail já está em uso por outro usuário.' });
    }
    // Erro se o usuário a ser atualizado não for encontrado
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado para atualizar.' });
    }
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
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
<<<<<<< HEAD
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
=======
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de usuário inválido.' });
    }

    // Soft delete é um 'update'
    const deletedUser = await prisma.usuarios.update({
      where: { id: id },
      data: { ativo: false },
      select: { id: true, ativo: true } // Retorna os campos atualizados
    });
    
    res.json({ message: 'Usuário desativado (soft delete) com sucesso!', user: deletedUser });
    
  } catch (error) {
    // Erro se o usuário a ser deletado não for encontrado
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado para deletar.' });
    }
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
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