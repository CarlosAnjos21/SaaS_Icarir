// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para tratamento de erro
const bcrypt = require('bcryptjs');

/**
 * @route   GET /api/admin/users
 * @desc    (Admin) Listar todos os usuários (com filtros)
 * @query   ?ativo=true&perfil=user&busca=samuel
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
  const { ativo, perfil, busca } = req.query;

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