const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // 1. Obter o token do cabeçalho de autorização
  const authHeader = req.header('Authorization');

  // 2. Verificar se o cabeçalho existe
  if (!authHeader) {
    return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
  }

  // 3. Verificar o formato do token (deve ser "Bearer <token>")
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token mal formatado. O formato é "Bearer <token>".' });
  }

  const token = parts[1];

  // 4. Validar o token
  try {
    // jwt.verify() decodifica o token usando sua chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Anexar o payload do usuário ao objeto 'req'
    // Lembre-se que salvamos o payload como { user: { id, email, role, ... } }
    req.user = decoded.user;
    
    // 6. Chamar 'next()' para passar para o próximo middleware ou controller
    next();

  } catch (error) {
    // Se o token for inválido (assinatura errada) ou expirado, jwt.verify() falha
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = authMiddleware;