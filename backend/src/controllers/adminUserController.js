const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const ALLOWED_ROLES = ['participante', 'admin', 'validador'];

const getAllUsers = async (req, res) => {
  const { ativo, perfil, busca } = req.query;

  const where = {
    ...(ativo !== undefined && { ativo: ativo === 'true' }),
    ...(perfil && { role: perfil }),
    ...(busca && {
      OR: [
        { nome: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } },
      ],
    }),
  };

  try {
    const users = await prisma.usuario.findMany({
      where,
      select: { id: true, nome: true, email: true, empresa: true, role: true, ativo: true, pontos: true, foto_url: true, data_criacao: true },
      orderBy: { nome: 'asc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const createUser = async (req, res) => {
  const { nome, email, senha, empresa, role, ativo, pontos } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        empresa: empresa || null,
        role: ALLOWED_ROLES.includes(role) ? role : 'participante',
        ativo: ativo ?? true,
        pontos: pontos ? parseInt(pontos) : 0,
      },
      select: { id: true, nome: true, email: true, empresa: true, role: true, ativo: true, pontos: true },
    });

    res.status(201).json({ message: 'Usuário criado com sucesso!', user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getUserById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const user = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true, empresa: true, role: true, ativo: true, pontos: true, foto_url: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const updateUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  const { nome, email, foto_url, role, ativo, pontos, empresa, senha } = req.body;

  const data = {
    ...(nome !== undefined && { nome }),
    ...(email !== undefined && { email }),
    ...(foto_url !== undefined && { foto_url }),
    ...(role !== undefined && ALLOWED_ROLES.includes(role) && { role }),
    ...(ativo !== undefined && { ativo }),
    ...(pontos !== undefined && { pontos: parseInt(pontos) }),
    ...(empresa !== undefined && { empresa }),
  };

  if (senha?.trim()) {
    const salt = await bcrypt.genSalt(10);
    data.senha = await bcrypt.hash(senha, salt);
  }

  try {
    const user = await prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nome: true, email: true, empresa: true, role: true, ativo: true, pontos: true, foto_url: true },
    });
    res.json({ message: 'Usuário atualizado com sucesso!', user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return res.status(409).json({ error: 'E-mail já em uso.' });
      if (error.code === 'P2025') return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    // Soft delete — consistente com o restante do projeto
    await prisma.usuario.update({
      where: { id },
      data: { ativo: false },
    });
    res.json({ message: 'Usuário desativado com sucesso.' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { getAllUsers, createUser, getUserById, updateUser, deleteUser };