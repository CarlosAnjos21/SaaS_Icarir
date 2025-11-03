// Importa o Prisma Client e o tratamento de erros
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');
const bcrypt = require('bcryptjs');

/**
 * @route   GET /api/admin/users
 * @desc    (Admin) Listar todos os usuários (com filtros)
 * @query   ?ativo=true&perfil=user&busca=samuel
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
  const { ativo, perfil, busca } = req.query;

  try {
    const where = {};

    if (ativo) where.ativo = ativo === 'true';
    if (perfil) where.role = perfil;
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.usuarios.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true,
        pontos: true,
        foto_url: true,
      },
      orderBy: { nome: 'asc' },
    });

    res.json(users);
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
    // Verifica duplicidade de e-mail
    const existingUser = await prisma.usuarios.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criação do usuário
    const newUser = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        empresa: empresa || null,
        role,
        ativo: ativo ?? true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true,
      },
    });

    res.status(201).json({
      message: 'Usuário criado pelo admin com sucesso!',
      user: newUser,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }
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
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de usuário inválido.' });
    }
    
  try {
    const user = await prisma.usuarios.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true,
        pontos: true,
        foto_url: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PATCH /api/admin/users/:id
 * @desc    (Admin) Atualizar dados de um usuário
 * @access  Admin
 */
const updateUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { nome, email, foto_url, role, ativo, pontos, empresa } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de usuário inválido.' });
  }

  try {
    const updatedUser = await prisma.usuarios.update({
      where: { id },
      data: {
        nome,
        email,
        foto_url,
        role,
        ativo,
        pontos,
        empresa,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true,
        pontos: true,
        foto_url: true,
      },
    });

    res.json({
      message: 'Usuário atualizado com sucesso!',
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Este e-mail já está em uso por outro usuário.' });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Usuário não encontrado para atualizar.' });
      }
    }

    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    (Admin) Desativar um usuário (soft delete)
 * @access  Admin
 */
const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de usuário inválido.' });
  }

  try {
    const deletedUser = await prisma.usuarios.update({
      where: { id },
      data: { ativo: false },
      select: { id: true, ativo: true },
    });

    res.json({
      message: 'Usuário desativado (soft delete) com sucesso!',
      user: deletedUser,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado para deletar.' });
    }

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
