<<<<<<< HEAD
const db = require('../config/db');
=======
// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para capturar erros
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

/**
 * @route   GET /api/missions
 * @desc    Listar todas as missões ativas
 * @access  Privado (requer token)
 */
const getAllActiveMissions = async (req, res) => {
  try {
    // Busca missões onde 'ativo' = true, ordenadas pela data de início
<<<<<<< HEAD
    const query = `
      SELECT id, titulo [cite: 57, 254], descricao [cite: 60, 257], foto_url [cite: 55], destino [cite: 65, 260], data_inicio [cite: 66, 271], data_fim [cite: 66, 271], preco [cite: 67, 271]
      FROM missoes 
      WHERE ativo = true 
      ORDER BY data_inicio ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
=======
    const missoes = await prisma.missoes.findMany({
      where: { ativo: true },
      // Seleciona os mesmos campos da query SQL original
      select: {
        id: true,
        titulo: true, // [cite: 57, 254]
        descricao: true, // [cite: 60, 257]
        foto_url: true, // [cite: 55]
        destino: true, // [cite: 65, 260]
        data_inicio: true, // [cite: 66, 271]
        data_fim: true, // [cite: 66, 271]
        preco: true // [cite: 67, 271]
      },
      orderBy: { data_inicio: 'asc' }
    });
    
    res.json(missoes);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
<<<<<<< HEAD
 * @route   GET /api/missions/:id
 * @desc    Buscar detalhes de uma missão específica
 * @access  Privado (requer token)
 */
const joinMission = async (req, res) => {
    const { missionId } = req.params;
    const userId = req.user.id; // Vem do authMiddleware
  
    // Iniciar um cliente de banco de dados para a transação
    const client = await db.pool.connect();
  
    try {
      // INICIAR TRANSAÇÃO
      await client.query('BEGIN');
  
      // 1. Verificar a missão (se existe e está ativa)
      const missionResult = await client.query(
        'SELECT preco, ativo FROM missoes WHERE id = $1',
        [missionId]
      );
  
      if (missionResult.rows.length === 0) {
        throw new Error('Missão não encontrada.');
      }
      if (!missionResult.rows[0].ativo) { // 
        throw new Error('Esta missão não está ativa.');
      }
  
      // 2. Verificar se o usuário já está inscrito
      const existingSub = await client.query(
        'SELECT id FROM usuarios_missoes WHERE usuario_id = $1 AND missao_id = $2', // [cite: 91, 312]
        [userId, missionId]
      );
  
      if (existingSub.rows.length > 0) {
        // Usar status 409 Conflict
        return res.status(409).json({ error: 'Você já está inscrito nesta missão.' });
      }
  
      // 3. Preparar dados para a nova inscrição
      const missionPrice = missionResult.rows[0].preco || 0.00; // 
      const paymentStatus = (missionPrice > 0) ? 'pendente' : 'nao_aplicavel'; // 
      const participationStatus = 'inscrito'; // 
  
      // 4. Inserir na tabela usuarios_missoes
      const insertQuery = `
        INSERT INTO usuarios_missoes 
          (usuario_id, missao_id, valor_pago, status_pagamento, status_participacao, data_compra, data_criacao, data_atualizacao)
        VALUES 
          ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
        RETURNING *;
      `; // [cite: 92, 88, 24, 123, 140]
      
      const values = [userId, missionId, missionPrice, paymentStatus, participationStatus];
      const newSubscription = await client.query(insertQuery, values);
  
      // COMMIT (Confirmar a transação)
      await client.query('COMMIT');
      
      res.status(201).json({
        message: 'Inscrição na missão realizada com sucesso!',
        subscription: newSubscription.rows[0],
      });
  
    } catch (error) {
      // ROLLBACK (Desfazer tudo em caso de erro)
      await client.query('ROLLBACK');
      
      // Enviar a mensagem de erro específica (ex: "Missão não encontrada.")
      if (error.message.includes('Missão')) {
        return res.status(404).json({ error: error.message });
      }
      
      console.error('Erro ao inscrever na missão:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
      // Sempre liberar o cliente de volta para o pool
      client.release();
    }
  };
  
  
  module.exports = {
    getAllActiveMissions,
    getMissionById,
    joinMission, // <<< Adicionar a nova função
  };
=======
 * @route   GET /api/missions/:missionId
 * @desc    Buscar detalhes de uma missão específica
 * @access  Privado (requer token)
 * @NOTE:   Esta função estava faltando no seu código mas estava em 'module.exports'
 */
const getMissionById = async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: 'ID da missão inválido.' });
    }

    const missao = await prisma.missoes.findFirst({
      where: { 
        id: missionId,
        // (Opcional: usuários podem ver missões inativas se tiverem o link?)
        // ativo: true 
      }
    });

    if (!missao) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }
    
    res.json(missao);

  } catch (error) {
    console.error('Erro ao buscar missão por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


/**
 * @route   POST /api/missions/:missionId/join
 * @desc    Inscrever o usuário logado em uma missão
 * @access  Privado
 */
const joinMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  if (isNaN(missionId)) {
    return res.status(400).json({ error: 'ID da missão inválido.' });
  }
  
  const userId = req.user.id; // Vem do authMiddleware
  
  try {
    // Usamos $transaction para garantir que as validações e a
    // inscrição sejam atômicas (tudo ou nada).
    const newSubscription = await prisma.$transaction(async (tx) => {
      
      // 1. Verificar a missão (se existe e está ativa)
      const mission = await tx.missoes.findUnique({
        where: { id: missionId },
        select: { preco: true, ativo: true }
      });

      if (!mission) {
        throw new Error('Missão não encontrada.');
      }
      if (!mission.ativo) {
        throw new Error('Esta missão não está ativa.');
      }

      // 2. Verificar se o usuário já está inscrito (usando o cliente de transação 'tx')
      // Esta checagem é boa, mas a checagem de erro P2002 abaixo é a garantia final.
      const existingSub = await tx.usuariosMissoes.findUnique({
        where: {
          // Usamos o índice composto definido no schema
          usuario_id_missao_id: { // 
            usuario_id: userId,
            missao_id: missionId
          }
        },
        select: { id: true }
      });

      if (existingSub) {
        throw new Error('Você já está inscrito nesta missão.');
      }

      // 3. Preparar dados para a nova inscrição
      const missionPrice = mission.preco || 0.00;
      const paymentStatus = (missionPrice > 0) ? 'pendente' : 'nao_aplicavel';
      const participationStatus = 'inscrito';

      // 4. Inserir na tabela usuarios_missoes (usando 'tx')
      const subscription = await tx.usuariosMissoes.create({
        data: {
          usuario_id: userId, // [cite: 92]
          missao_id: missionId, // [cite: 88]
          valor_pago: missionPrice, // [cite: 24]
          status_pagamento: paymentStatus, // [cite: 123]
          status_participacao: participationStatus, // [cite: 140]
          // data_compra, data_criacao, data_atualizacao usam default(now())
        }
      });

      return subscription; // Retorna o resultado para fora da transação
    });

    // Se a transação foi concluída (COMMIT automático)
    res.status(201).json({
      message: 'Inscrição na missão realizada com sucesso!',
      subscription: newSubscription,
    });

  } catch (error) {
    // Se a transação falhou (ROLLBACK automático)
    
    // Captura o erro de chave única (usuário já inscrito)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Você já está inscrito nesta missão.' });
    }
    
    // Captura os erros que lançamos manualmente
    if (error.message.includes('Missão não encontrada') || error.message.includes('Esta missão não está ativa')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Você já está inscrito')) {
      return res.status(409).json({ error: error.message });
    }
    
    console.error('Erro ao inscrever na missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
  // Não precisamos mais do 'finally { client.release() }'
};


module.exports = {
  getAllActiveMissions,
  getMissionById, // Função que foi adicionada
  joinMission,
};
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
