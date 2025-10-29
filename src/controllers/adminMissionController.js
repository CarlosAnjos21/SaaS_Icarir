const db = require('../config/db');

/**
 * @route   POST /api/admin/missions
 * @desc    (Admin) Criar uma nova missão
 * @access  Admin
 */
const createMission = async (req, res) => {
  // Baseado nos campos da tabela 'missoes' [cite: 249]
  const {
    titulo, // [cite: 254]
    descricao, // [cite: 257]
    foto_url, // [cite: 55]
    destino, // [cite: 258]
    data_inicio, // [cite: 271]
    data_fim, // [cite: 271]
    preco, // [cite: 271]
    vagas_disponiveis, // [cite: 272]
    ativo, // [cite: 68]
    missao_anterior_id // [cite: 280]
  } = req.body;

  // Validação
  if (!titulo || !data_inicio || !data_fim) {
    return res.status(400).json({ error: 'Título, data de início e data de fim são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO missoes (
        titulo, descricao, foto_url, destino, data_inicio, 
        data_fim, preco, vagas_disponiveis, ativo, missao_anterior_id, 
        data_criacao, data_atualizacao
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *;
    `;
    const values = [
      titulo,
      descricao || null,
      foto_url || null,
      destino || null,
      data_inicio,
      data_fim,
      preco || 0.00,
      vagas_disponiveis || null,
      ativo || false,
      missao_anterior_id || null
    ];
    
    const { rows } = await db.query(query, values);
    res.status(201).json({ message: 'Missão criada com sucesso!', mission: rows[0] });

  } catch (error) {
    console.error('Erro ao criar missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/missions
 * @desc    (Admin) Listar TODAS as missões (ativas e inativas)
 * @access  Admin
 */
const getAllMissions = async (req, res) => {
  try {
    // Admins veem tudo, não apenas as ativas
    const { rows } = await db.query('SELECT * FROM missoes ORDER BY data_inicio DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar todas as missões:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/missions/:missionId
 * @desc    (Admin) Buscar detalhes de uma missão específica
 * @access  Admin
 */
const getMissionById = async (req, res) => {
  try {
    const { missionId } = req.params;
    const { rows } = await db.query('SELECT * FROM missoes WHERE id = $1', [missionId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }
    res.json(rows[0]);

  } catch (error) {
    console.error('Erro ao buscar missão por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/admin/missions/:missionId
 * @desc    (Admin) Atualizar uma missão
 * @access  Admin
 */
const updateMission = async (req, res) => {
  try {
    const { missionId } = req.params;
    const {
      titulo, descricao, foto_url, destino, data_inicio, 
      data_fim, preco, vagas_disponiveis, ativo, missao_anterior_id
    } = req.body;

    if (!titulo || !data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Título, data de início e data de fim são obrigatórios.' });
    }

    const updateQuery = `
      UPDATE missoes
      SET 
        titulo = $1,
        descricao = $2,
        foto_url = $3,
        destino = $4,
        data_inicio = $5,
        data_fim = $6,
        preco = $7,
        vagas_disponiveis = $8,
        ativo = $9,
        missao_anterior_id = $10,
        data_atualizacao = NOW()
      WHERE id = $11
      RETURNING *;
    `;
    const values = [
      titulo, descricao, foto_url, destino, data_inicio,
      data_fim, preco, vagas_disponiveis, ativo, missao_anterior_id,
      missionId
    ];

    const { rows } = await db.query(updateQuery, values);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Missão não encontrada para atualizar.' });
    }
    
    res.json({ message: 'Missão atualizada com sucesso!', mission: rows[0] });

  } catch (error) {
    console.error('Erro ao atualizar missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/missions/:missionId
 * @desc    (Admin) Deletar uma missão (Soft Delete)
 * @access  Admin
 */
const softDeleteMission = async (req, res) => {
  // Nota: Vamos fazer um "soft delete" (apenas desativar) 
  // para preservar o histórico dos usuários que já a completaram.
  // Um DELETE real poderia quebrar foreign keys.
  try {
    const { missionId } = req.params;
    
    const deleteQuery = `
      UPDATE missoes
      SET ativo = false,
          data_atualizacao = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    
    const { rows } = await db.query(deleteQuery, [missionId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Missão não encontrada para deletar.' });
    }
    
    res.json({ message: 'Missão desativada (soft delete) com sucesso!', mission: rows[0] });

  } catch (error) {
    console.error('Erro ao deletar missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


module.exports = {
  createMission,
  getAllMissions,
  getMissionById,
  updateMission,
  softDeleteMission,
};