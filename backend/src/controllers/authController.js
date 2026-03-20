const prisma = require('../config/prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
require('dotenv').config();

const register = async (req, res) => {
  const { nome, email, senha, role, adminKey } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  let userRole = 'participante';
  if (role === 'admin') {
    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({ error: 'Chave de administrador inválida.' });
    }
    userRole = 'admin';
  }

  try {
    const senhaHash = await bcrypt.hash(senha, await bcrypt.genSalt(10));

    const user = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash, role: userRole, ativo: true },
      select: { id: true, nome: true, email: true, role: true, ativo: true },
    });

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }
    console.error('Erro ao cadastrar:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(senha, user.senha))) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    if (!user.ativo) {
      return res.status(403).json({ error: 'Usuário inativo.' });
    }

    const payload = { user: { id: user.id, email: user.email, role: user.role } };

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION,
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Login bem-sucedido!', accessToken, user: payload.user });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'Token de renovação ausente.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { user: decoded.user },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );
    res.json({ accessToken, user: decoded.user });
  } catch {
    res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};

const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logout bem-sucedido.' });
};

const getMe = async (req, res) => {
  try {
    const userWithProfile = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: { perfil: true },
    });

    if (!userWithProfile) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const { perfil, senha, ...base } = userWithProfile;
    res.json({ ...base, ...(perfil || {}) });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { register, login, refreshToken, logout, getMe };