const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

const getAllEnrollments = async (req, res) => {
  const { usuario_id, missao_id } = req.query;

  const where = {
    ...(usuario_id && { usuario_id: parseInt(usuario_id, 10) }),
    ...(missao_id && { missao_id: parseInt(missao_id, 10) }),
  };

  try {
    const enrollments = await prisma.usuarioMissao.findMany({
      where,
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        missao: { select: { id: true, titulo: true } },
      },
      orderBy: { data_compra: 'desc' }, // campo correto do schema
    });
    res.json(enrollments);
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getEnrollmentById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const enrollment = await prisma.usuarioMissao.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        missao: { select: { id: true, titulo: true } },
      },
    });
    if (!enrollment) return res.status(404).json({ error: 'Inscrição não encontrada.' });
    res.json(enrollment);
  } catch (error) {
    console.error('Erro ao buscar inscrição:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const updateEnrollment = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  const { valor_pago, status_pagamento, status_participacao } = req.body;

  try {
    const enrollment = await prisma.usuarioMissao.update({
      where: { id },
      data: {
        ...(valor_pago !== undefined && { valor_pago: parseFloat(valor_pago) }),
        ...(status_pagamento !== undefined && { status_pagamento }),
        ...(status_participacao !== undefined && { status_participacao }),
      },
    });
    res.json({ message: 'Inscrição atualizada com sucesso!', enrollment });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Inscrição não encontrada.' });
    }
    console.error('Erro ao atualizar inscrição:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const deleteEnrollment = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    await prisma.usuarioMissao.delete({ where: { id } });
    res.json({ message: 'Inscrição deletada com sucesso.' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Inscrição não encontrada.' });
    }
    console.error('Erro ao deletar inscrição:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { getAllEnrollments, getEnrollmentById, updateEnrollment, deleteEnrollment };