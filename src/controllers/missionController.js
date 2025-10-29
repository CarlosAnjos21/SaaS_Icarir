const db = require('../config/db');

/**
 * @route   GET /api/missions
 * @desc    Listar todas as missões ativas
 * @access  Privado (requer token)
 */
const getAllActiveMissions = async (req, res) => {
  try {
    // Busca missões onde 'ativo' = true, ordenadas pela data de início
    const query = `
      SELECT id, titulo [cite: 57, 254], descricao [cite: 60, 257], foto_url [cite: 55], destino [cite: 65, 260], data_inicio [cite: 66, 271], data_fim [cite: 66, 271], preco [cite: 67, 271]
      FROM missoes 
      WHERE ativo = true 
      ORDER BY data_inicio ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);

  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
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