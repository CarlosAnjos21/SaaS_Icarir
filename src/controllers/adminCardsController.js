const db = require('../config/db');

/**
 * @route   POST /api/admin/cards
 * @desc    (Admin) Criar um novo selo (card)
 * @access  Admin
 */
const createCard = async (req, res) => {
  // Campos da tabela 'cards' [cite: 166, 167, 168, 170]
  const {
    tarefa_id, // 
    titulo, // [cite: 167]
    descricao, // [cite: 168]
    ativo // [cite: 170]
  } = req.body;

  if (!titulo || !tarefa_id) {
    return res.status(400).json({ error: 'Os campos "titulo" e "tarefa_id" são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO cards (tarefa_id, titulo, descricao, ativo, data_criacao)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const values = [
      tarefa_id,
      titulo,
      descricao || null,
      ativo || false
    ];

    const { rows } = await db.query(query, values);
    res.status(201).json({ message: 'Selo (Card) criado com sucesso!', card: rows[0] });

  } catch (error) {
    console.error('Erro ao criar card:', error);
    if (error.code === '23503') { //
      return res.status(404).json({ error: 'ID da tarefa (tarefa_id) é inválido.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/cards
 * @desc    (Admin) Listar todos os selos (cards)
 * @access  Admin
 */
const getAllCards = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM cards ORDER BY data_criacao DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar cards:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/cards/:cardId
 * @desc    (Admin) Buscar detalhes de um selo (card)
 * @access  Admin
 */
const getCardById = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { rows } = await db.query('SELECT * FROM cards WHERE id = $1', [cardId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Selo (Card) não encontrado.' });
    }
    res.json(rows[0]);

  } catch (error) {
    console.error('Erro ao buscar card por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/admin/cards/:cardId
 * @desc    (Admin) Atualizar um selo (card)
 * @access  Admin
 */
const updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { tarefa_id, titulo, descricao, ativo } = req.body;

    if (!titulo || !tarefa_id) {
      return res.status(400).json({ error: 'Os campos "titulo" e "tarefa_id" são obrigatórios.' });
    }

    const updateQuery = `
      UPDATE cards
      SET
        tarefa_id = $1,
        titulo = $2,
        descricao = $3,
        ativo = $4,
        data_atualizacao = NOW()
      WHERE id = $5
      RETURNING *;
    `;
    const values = [tarefa_id, titulo, descricao, ativo, cardId];

    const { rows } = await db.query(updateQuery, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Selo (Card) não encontrado para atualizar.' });
    }

    res.json({ message: 'Selo (Card) atualizado com sucesso!', card: rows[0] });

  } catch (error) {
    console.error('Erro ao atualizar card:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/cards/:cardId
 * @desc    (Admin) Desativar (soft delete) um selo (card)
 * @access  Admin
 */
const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const deleteQuery = `
      UPDATE cards
      SET ativo = false, data_atualizacao = NOW()
      WHERE id = $1
      RETURNING *;
    `; // [cite: 170]

    const { rows } = await db.query(deleteQuery, [cardId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Selo (Card) não encontrado para deletar.' });
    }

    res.json({ message: 'Selo (Card) desativado (soft delete) com sucesso!', card: rows[0] });

  } catch (error) {
    console.error('Erro ao deletar card:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  createCard,
  getAllCards,
  getCardById,
  updateCard,
  deleteCard,
};