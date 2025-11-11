// Importa o Prisma Client
<<<<<<< HEAD
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para tratamento de erro
const bcrypt = require('bcryptjs');
=======
const prisma = require("../config/prismaClient");
const { Prisma } = require("@prisma/client"); // Para tratamento de erros específicos do Prisma
const bcrypt = require("bcryptjs");
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

/**
 * @route   GET /api/admin/users
 * @desc    (Admin) Listar todos os usuários com filtros dinâmicos
 * @query   ?ativo=true&perfil=user&busca=samuel
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
  const { ativo, perfil, busca } = req.query;

<<<<<<< HEAD
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
=======
  const where = {};
  if (ativo) where.ativo = ativo === "true";
  if (perfil) where.role = perfil;
  if (busca) {
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    where.OR = [
      { nome: { contains: busca, mode: "insensitive" } },
      { email: { contains: busca, mode: "insensitive" } },
    ];
  }

  try {
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
      orderBy: { nome: "asc" },
    });

    res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

/**
 * @route   POST /api/admin/users
 * @desc    (Admin) Criar um novo usuário manualmente
 * @access  Admin
 */
const createUser = async (req, res) => {
  const { nome, email, senha, empresa, role, ativo } = req.body;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ error: "Nome, email e senha são obrigatórios." });
  }

  const allowedRoles = ["user", "admin"];
  const finalRole = allowedRoles.includes(role) ? role : "user";

  try {
<<<<<<< HEAD
    // 1. Verificar se e-mail já existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { email: email }
    });
=======
    const existingUser = await prisma.usuarios.findUnique({ where: { email } });
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    if (existingUser) {
      return res.status(409).json({ error: "Este e-mail já está cadastrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 3️⃣ Cria o novo usuário
    const newUser = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        empresa: empresa || null,
        role: finalRole,
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

    res
      .status(201)
      .json({ message: "Usuário criado com sucesso!", user: newUser });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ error: "Este e-mail já está cadastrado." });
    }
<<<<<<< HEAD
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
=======
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
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
    if (isNaN(id))
      return res.status(400).json({ error: "ID de usuário inválido." });

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

    if (!user)
      return res.status(404).json({ error: "Usuário não encontrado." });
    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
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
    if (isNaN(id))
      return res.status(400).json({ error: "ID de usuário inválido." });

    const { nome, email, foto_url, role, ativo, pontos, empresa } = req.body;

    const allowedRoles = ["user", "admin"];
    const finalRole = allowedRoles.includes(role) ? role : undefined;

    const updatedUser = await prisma.usuarios.update({
      where: { id },
      data: {
        nome,
        email,
        foto_url,
        role: finalRole,
        ativo,
        pontos,
        empresa,
        data_atualizacao: new Date(),
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

    res.json({ message: "Usuário atualizado com sucesso!", user: updatedUser });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res
          .status(409)
          .json({ error: "Este e-mail já está em uso por outro usuário." });
      }
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ error: "Usuário não encontrado para atualizar." });
      }
    }
<<<<<<< HEAD
    // Erro se o usuário a ser atualizado não for encontrado
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado para atualizar.' });
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
=======
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
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
    if (isNaN(id))
      return res.status(400).json({ error: "ID de usuário inválido." });

    const deletedUser = await prisma.usuarios.update({
      where: { id },
      data: { ativo: false, data_atualizacao: new Date() },
      select: { id: true, ativo: true },
    });

    res.json({ message: "Usuário desativado com sucesso!", user: deletedUser });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res
        .status(404)
        .json({ error: "Usuário não encontrado para deletar." });
    }
<<<<<<< HEAD
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
=======
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
  }
};
module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
