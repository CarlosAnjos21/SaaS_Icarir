const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Garante que o process.env.JWT_SECRET seja lido

// --- FUNÇÃO DE CADASTRO ---
const register = async (req, res) => {
  const { nome, email, senha, codigo_empresa } = req.body;

  if (!nome || !email || !senha || !codigo_empresa) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const emailCheck = await db.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

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
    
    const values = [nome, email, senhaHash, codigo_empresa, 'user', true];
    
    const newUser = await db.query(query, values);

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: newUser.rows[0],
    });

  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// --- LOGIN (Refatorado para 2 tokens) ---
const login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }
  try {
    const userResult = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const user = userResult.rows[0];
    if (!user.ativo) {
      return res.status(403).json({ error: 'Este usuário está inativo.' });
    }
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Payload que será compartilhado pelos dois tokens
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        empresa: user.empresa
      },
    };

    // 1. GERAR ACCESS TOKEN (vida curta)
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );

    // 2. GERAR REFRESH TOKEN (vida longa)
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );

    // 3. ENVIAR REFRESH TOKEN COMO HttpOnly COOKIE
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Impede acesso via JavaScript
      secure: process.env.NODE_ENV === 'production', // Use 'true' em produção (HTTPS)
      sameSite: 'strict', // Proteção CSRF
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias (deve ser o mesmo do token)
    });

    // 4. ENVIAR ACCESS TOKEN E DADOS DO USUÁRIO NO JSON
    res.json({
      message: 'Login bem-sucedido!',
      accessToken: accessToken,
      user: payload.user
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// --- REFRESH TOKEN (Novo) ---
const refreshToken = (req, res) => {
  // 1. Pegar o refresh token do cookie
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Nenhum token de renovação.' });
  }

  try {
    // 2. Verificar o refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // O token é válido, gerar um NOVO Access Token
    const payload = { user: decoded.user };
    
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );
    
    res.json({
      message: 'Token de acesso renovado!',
      accessToken: accessToken,
      user: decoded.user
    });

  } catch (error) {
    // Refresh token é inválido ou expirou
    res.status(403).json({ error: 'Token de renovação inválido ou expirado. Faça login novamente.' });
  }
};

// --- LOGOUT (Novo) ---
const logout = (req, res) => {
  // O logout simplesmente limpa o cookie HttpOnly
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logout bem-sucedido.' });
};

// --- GET ME (Movido do userController) ---
const getMe = async (req, res) => {
  try {
    // O ID vem do 'authMiddleware' que já rodou
    const userId = req.user.id; 

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


module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};