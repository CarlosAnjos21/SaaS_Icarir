const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Garante que o process.env.JWT_SECRET seja lido

// --- FUNÇÃO DE CADASTRO (que já fizemos) ---
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

// --- NOVA FUNÇÃO DE LOGIN ---
const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // 1. Encontrar o usuário pelo e-mail
    const userResult = await db.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Usamos uma mensagem genérica por segurança
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const user = userResult.rows[0];

    // 2. Verificar se o usuário está ativo (baseado no seu diagrama)
    if (!user.ativo) {
      return res.status(403).json({ error: 'Este usuário está inativo.' });
    }

    // 3. Comparar a senha enviada com a senha criptografada no banco
    const isMatch = await bcrypt.compare(senha, user.senha);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // 4. Se a senha estiver correta, criar o Token JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role, // O role é crucial para autorização
        empresa: user.empresa // A "turma" dele
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }, // Token expira em 7 dias
      (err, token) => {
        if (err) throw err;
        
        // 5. Enviar o token para o cliente
        res.json({
          message: 'Login bem-sucedido!',
          token: token,
          user: payload.user // Enviamos os dados do usuário (sem a senha)
        });
      }
    );

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


module.exports = {
  register,
  login, // Exportamos a nova função
};