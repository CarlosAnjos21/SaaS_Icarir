<<<<<<< HEAD
const db = require('../config/db');
=======
// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para tratamento de erro
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

/**
 * @route   POST /api/admin/missions
 * @desc    (Admin) Criar uma nova missão
 * @access  Admin
 */
const createMission = async (req, res) => {
<<<<<<< HEAD
  // Baseado nos campos da tabela 'missoes' [cite: 249]
=======
  // Baseado nos campos da tabela 'missoes' 
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
  const {
    titulo, // [cite: 254]
    descricao, // [cite: 257]
    foto_url, // [cite: 55]
    destino, // [cite: 258]
<<<<<<< HEAD
    data_inicio, // [cite: 271]
    data_fim, // [cite: 271]
    preco, // [cite: 271]
    vagas_disponiveis, // [cite: 272]
    ativo, // [cite: 68]
=======
    data_inicio, // 
    data_fim, // 
    preco, // 
    vagas_disponiveis, // 
    ativo, // 
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    missao_anterior_id // [cite: 280]
  } = req.body;

  // Validação
  if (!titulo || !data_inicio || !data_fim) {
    return res.status(400).json({ error: 'Título, data de início e data de fim são obrigatórios.' });
  }

  try {
<<<<<<< HEAD
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
=======
    const newMission = await prisma.missoes.create({
      data: {
        titulo: titulo,
        descricao: descricao || null,
        foto_url: foto_url || null,
        destino: destino || null,
        data_inicio: new Date(data_inicio), // Converte string para Date
        data_fim: new Date(data_fim),       // Converte string para Date
        preco: preco ? parseFloat(preco) : 0.00,
        vagas_disponiveis: vagas_disponiveis ? parseInt(vagas_disponiveis, 10) : null,
        ativo: ativo || false,
        missao_anterior_id: missao_anterior_id ? parseInt(missao_anterior_id, 10) : null
      }
    });
    
    res.status(201).json({ message: 'Missão criada com sucesso!', mission: newMission });

  } catch (error) {
    // Erro de FK (missao_anterior_id não existe)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
       return res.status(404).json({ error: 'ID da missão anterior (missao_anterior_id) é inválido.' });
    }
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
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
<<<<<<< HEAD
    const { rows } = await db.query('SELECT * FROM missoes ORDER BY data_inicio DESC');
    res.json(rows);
=======
    const missions = await prisma.missoes.findMany({
      orderBy: {
        data_inicio: 'desc'
      }
    });
    res.json(missions);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
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
<<<<<<< HEAD
    const { missionId } = req.params;
    const { rows } = await db.query('SELECT * FROM missoes WHERE id = $1', [missionId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }
    res.json(rows[0]);
=======
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
        return res.status(400).json({ error: 'ID da missão inválido.' });
    }
    
    const mission = await prisma.missoes.findUnique({
      where: { id: missionId }
    });
    
    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }
    res.json(mission);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

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
<<<<<<< HEAD
    const { missionId } = req.params;
=======
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
        return res.status(400).json({ error: 'ID da missão inválido.' });
    }

>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    const {
      titulo, descricao, foto_url, destino, data_inicio, 
      data_fim, preco, vagas_disponiveis, ativo, missao_anterior_id
    } = req.body;

    if (!titulo || !data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Título, data de início e data de fim são obrigatórios.' });
    }

<<<<<<< HEAD
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
=======
    const updatedMission = await prisma.missoes.update({
      where: { id: missionId },
      data: {
        titulo: titulo,
        descricao: descricao || null,
        foto_url: foto_url || null,
        destino: destino || null,
        data_inicio: new Date(data_inicio),
        data_fim: new Date(data_fim),
        preco: preco ? parseFloat(preco) : 0.00,
        vagas_disponiveis: vagas_disponiveis ? parseInt(vagas_disponiveis, 10) : null,
        ativo: ativo,
        missao_anterior_id: missao_anterior_id ? parseInt(missao_anterior_id, 10) : null
      }
    });
    
    res.json({ message: 'Missão atualizada com sucesso!', mission: updatedMission });

  } catch (error) {
    // Erro se a missão a ser atualizada não for encontrada
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Missão não encontrada para atualizar.' });
    }
    // Erro de FK (missao_anterior_id não existe)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
       return res.status(404).json({ error: 'ID da missão anterior (missao_anterior_id) é inválido.' });
    }
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
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
<<<<<<< HEAD
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
=======
  try {
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
        return res.status(400).json({ error: 'ID da missão inválido.' });
    }
    
    // Soft delete (apenas desativa)
    const deletedMission = await prisma.missoes.update({
      where: { id: missionId },
      data: {
        ativo: false, // 
      }
    });
    
    res.json({ message: 'Missão desativada (soft delete) com sucesso!', mission: deletedMission });

  } catch (error) {
    // Erro se a missão a ser deletada não for encontrada
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Missão não encontrada para deletar.' });
    }
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
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