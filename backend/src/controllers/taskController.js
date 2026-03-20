const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');
const supabase = require('../config/supabaseClient');

const VALID_TIPOS = ['administrativa', 'conhecimento', 'engajamento', 'social', 'feedback'];
const VALID_DIFICULDADES = ['facil', 'medio', 'dificil'];

const parseRequisitos = (r) => {
  if (!r || typeof r !== 'string') return r;
  try { return JSON.parse(r); } catch { return r; }
};

const getTasksByMissionId = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const tarefas = await prisma.tarefa.findMany({
      where: { missao_id: missionId, ativa: true },
      orderBy: { ordem: 'asc' },
      include: { quiz: { include: { perguntas: { orderBy: { ordem: 'asc' } } } } },
    });
    res.json(tarefas.map((t) => ({ ...t, requisitos: parseRequisitos(t.requisitos) })));
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getTaskById = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const taskId = parseInt(req.params.taskId, 10);
  if (isNaN(missionId) || isNaN(taskId)) return res.status(400).json({ error: 'IDs inválidos.' });

  try {
    const tarefa = await prisma.tarefa.findFirst({
      where: { id: taskId, missao_id: missionId },
      include: { quiz: { include: { perguntas: { orderBy: { ordem: 'asc' } } } } },
    });
    if (!tarefa) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    res.json({ ...tarefa, requisitos: parseRequisitos(tarefa.requisitos) });
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const submitTask = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const taskId = parseInt(req.params.taskId, 10);
  const userId = req.user.id;
  const { evidencias } = req.body;

  if (!evidencias) return res.status(400).json({ error: 'O campo "evidencias" é obrigatório.' });
  if (isNaN(missionId) || isNaN(taskId)) return res.status(400).json({ error: 'IDs inválidos.' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.tarefa.findFirst({
        where: { id: taskId, missao_id: missionId, ativa: true },
        include: { quiz: { include: { perguntas: true } } },
      });
      if (!task) throw Object.assign(new Error('Tarefa não encontrada ou inativa.'), { status: 403 });

      const enrollment = await tx.usuarioMissao.findFirst({
        where: { usuario_id: userId, missao_id: missionId },
      });
      if (!enrollment) throw Object.assign(new Error('Você não está inscrito nesta missão.'), { status: 403 });

      const existing = await tx.usuarioTarefa.findUnique({
        where: { usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: taskId } },
      });
      if (existing?.concluida) throw Object.assign(new Error('Esta tarefa já foi concluída.'), { status: 409 });

      let pontosObtidos = 0;
      let isConcluida = false;

      // Validação automática de quiz
      if (task.tipo === 'conhecimento' && task.quiz && evidencias.type === 'quiz' && evidencias.answers) {
        const perguntas = task.quiz.perguntas;
        const total = perguntas.length;

        if (total > 0) {
          const acertos = perguntas.filter((p) => {
            const resposta = evidencias.answers[p.id];
            return resposta !== undefined && String(resposta) === String(p.resposta_correta);
          }).length;

          pontosObtidos = Math.round((task.pontos * acertos) / total);
          isConcluida = pontosObtidos > 0;
        }
      }

      const submissionData = {
        usuario_id: userId,
        tarefa_id: taskId,
        evidencias,
        concluida: isConcluida,
        pontos_obtidos: pontosObtidos,
        data_conclusao: isConcluida ? new Date() : null,
        // validado_por é Int? no schema — null para sistema, só admin preenche
        validado_por: null,
        tentativas: (existing?.tentativas || 0) + 1,
      };

      return tx.usuarioTarefa.upsert({
        where: { usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: taskId } },
        update: submissionData,
        create: submissionData,
      });
    });

    res.status(201).json({
      message: result.concluida
        ? `Tarefa concluída! Você ganhou ${result.pontos_obtidos} pontos.`
        : 'Tarefa submetida para validação.',
      submission: result,
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error('Erro ao submeter tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Upload via Supabase Storage (memoryStorage — sem file.filename local)
const uploadEvidence = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const taskId = parseInt(req.params.taskId, 10);
  const userId = req.user.id;

  if (isNaN(missionId) || isNaN(taskId)) return res.status(400).json({ error: 'IDs inválidos.' });
  if (!req.files?.length) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

  try {
    const uploadedUrls = await Promise.all(
      req.files.map(async (file) => {
        const ext = file.originalname.split('.').pop();
        const path = `evidences/${userId}/${taskId}/${Date.now()}.${ext}`;

        const { error } = await supabase.storage
          .from('uploads')
          .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });

        if (error) throw new Error(`Supabase upload error: ${error.message}`);

        const { data } = supabase.storage.from('uploads').getPublicUrl(path);
        return { originalName: file.originalname, mimeType: file.mimetype, size: file.size, url: data.publicUrl };
      })
    );

    const existing = await prisma.usuarioTarefa.findUnique({
      where: { usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: taskId } },
    });

    const result = await prisma.usuarioTarefa.upsert({
      where: { usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: taskId } },
      update: { evidencias: uploadedUrls, tentativas: (existing?.tentativas || 0) + 1 },
      create: {
        usuario_id: userId,
        tarefa_id: taskId,
        evidencias: uploadedUrls,
        concluida: false,
        pontos_obtidos: 0,
        tentativas: 1,
      },
    });

    res.status(201).json({ message: 'Evidências enviadas com sucesso.', submission: result });
  } catch (error) {
    console.error('Erro ao enviar evidências:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const createTaskForMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

  const { categoria_id, titulo, descricao, instrucoes, pontos, tipo, dificuldade, ordem, requisitos, quiz, tarefa_anterior_id } = req.body;

  if (!titulo || !pontos || !tipo || !dificuldade) {
    return res.status(400).json({ error: 'titulo, pontos, tipo e dificuldade são obrigatórios.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const missao = await tx.missao.findUnique({ where: { id: missionId } });
      if (!missao) throw Object.assign(new Error('Missão não encontrada.'), { status: 404 });

      const task = await tx.tarefa.create({
        data: {
          missao_id: missionId,
          categoria_id: categoria_id ? parseInt(categoria_id, 10) : null,
          titulo,
          descricao: descricao || null,
          instrucoes: instrucoes || null,
          pontos: parseInt(pontos, 10),
          tipo: VALID_TIPOS.includes(tipo) ? tipo : null,
          dificuldade: VALID_DIFICULDADES.includes(dificuldade) ? dificuldade : 'facil',
          ativa: true,
          ordem: ordem ? parseInt(ordem, 10) : 0,
          requisitos: requisitos || Prisma.JsonNull,
          tarefa_anterior_id: tarefa_anterior_id ? parseInt(tarefa_anterior_id, 10) : null,
        },
      });

      // Cria quiz sem tentar setar quizId (campo não existe no schema)
      if (tipo === 'conhecimento' && quiz?.perguntas?.length > 0) {
        await tx.quiz.create({
          data: {
            tarefa_id: task.id,
            titulo: `Quiz: ${titulo}`,
            descricao: 'Responda corretamente para pontuar.',
            ativo: true,
            perguntas: {
              create: quiz.perguntas.map((q, i) => ({
                enunciado: q.enunciado,
                tipo: 'multipla_escolha',
                opcoes: q.opcoes || [],
                resposta_correta: q.resposta_correta,
                ordem: i,
              })),
            },
          },
        });
      }

      return tx.tarefa.findUnique({
        where: { id: task.id },
        include: { quiz: { include: { perguntas: true } } },
      });
    });

    res.status(201).json({ message: 'Tarefa criada com sucesso!', task: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(400).json({ error: 'ID da categoria ou missão inválido.' });
    }
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const updateTask = async (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  if (isNaN(taskId)) return res.status(400).json({ error: 'ID inválido.' });

  const { categoria_id, titulo, descricao, instrucoes, pontos, tipo, dificuldade, ordem, requisitos, quiz, tarefa_anterior_id, ativa } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const data = {
        ...(categoria_id !== undefined && { categoria_id: categoria_id ? parseInt(categoria_id, 10) : null }),
        ...(titulo !== undefined && { titulo }),
        ...(descricao !== undefined && { descricao }),
        ...(instrucoes !== undefined && { instrucoes }),
        ...(pontos !== undefined && { pontos: parseInt(pontos, 10) }),
        ...(tipo !== undefined && { tipo: VALID_TIPOS.includes(tipo) ? tipo : null }),
        ...(dificuldade !== undefined && { dificuldade: VALID_DIFICULDADES.includes(dificuldade) ? dificuldade : 'facil' }),
        ...(ordem !== undefined && { ordem: parseInt(ordem, 10) }),
        ...(ativa !== undefined && { ativa }),
        ...(tarefa_anterior_id !== undefined && { tarefa_anterior_id: tarefa_anterior_id ? parseInt(tarefa_anterior_id, 10) : null }),
        ...(requisitos !== undefined && { requisitos }),
      };

      await tx.tarefa.update({ where: { id: taskId }, data });

      if (quiz?.perguntas) {
        const existing = await tx.quiz.findUnique({ where: { tarefa_id: taskId } });

        if (existing) {
          if (quiz.titulo) await tx.quiz.update({ where: { id: existing.id }, data: { titulo: quiz.titulo, ...(quiz.descricao !== undefined && { descricao: quiz.descricao }) } });

          await tx.perguntaQuiz.deleteMany({ where: { quiz_id: existing.id } });
          if (quiz.perguntas.length > 0) {
            await tx.perguntaQuiz.createMany({
              data: quiz.perguntas.map((q, i) => ({
                quiz_id: existing.id,
                enunciado: q.enunciado,
                tipo: 'multipla_escolha',
                opcoes: q.opcoes || [],
                resposta_correta: q.resposta_correta,
                ordem: i,
              })),
            });
          }
        } else if (quiz.perguntas.length > 0) {
          // Cria quiz sem quizId (não existe no schema)
          await tx.quiz.create({
            data: {
              tarefa_id: taskId,
              titulo: quiz.titulo || `Quiz: ${titulo || 'Tarefa'}`,
              descricao: quiz.descricao || '',
              ativo: true,
              perguntas: {
                create: quiz.perguntas.map((q, i) => ({
                  enunciado: q.enunciado,
                  tipo: 'multipla_escolha',
                  opcoes: q.opcoes || [],
                  resposta_correta: q.resposta_correta,
                  ordem: i,
                })),
              },
            },
          });
        }
      }

      return tx.tarefa.findUnique({
        where: { id: taskId },
        include: { quiz: { include: { perguntas: { orderBy: { ordem: 'asc' } } } } },
      });
    });

    res.json({ message: 'Tarefa atualizada com sucesso!', task: result });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar tarefa.' });
  }
};

const createQuizForTask = async (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  if (isNaN(taskId)) return res.status(400).json({ error: 'ID inválido.' });

  const { titulo, descricao, perguntas } = req.body;
  if (!titulo || !Array.isArray(perguntas) || perguntas.length === 0) {
    return res.status(400).json({ error: 'Título e perguntas são obrigatórios.' });
  }

  try {
    const quiz = await prisma.$transaction(async (tx) => {
      const tarefa = await tx.tarefa.findUnique({ where: { id: taskId }, include: { quiz: true } });
      if (!tarefa) throw Object.assign(new Error('Tarefa não encontrada.'), { status: 404 });
      if (tarefa.quiz) throw Object.assign(new Error('Esta tarefa já possui um quiz.'), { status: 409 });

      return tx.quiz.create({
        data: {
          tarefa_id: taskId,
          titulo,
          descricao: descricao || null,
          ativo: true,
          perguntas: {
            create: perguntas.map((p, i) => ({
              enunciado: p.enunciado,
              tipo: p.tipo || 'multipla_escolha',
              opcoes: p.opcoes || [],
              resposta_correta: p.resposta_correta,
              explicacao: p.explicacao || null,
              ordem: i,
            })),
          },
        },
        include: { perguntas: true },
      });
    });

    res.status(201).json({ message: 'Quiz criado com sucesso.', quiz });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error('Erro ao criar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao criar quiz.' });
  }
};

module.exports = {
  getTasksByMissionId, getTaskById, submitTask,
  uploadEvidence, createTaskForMission, updateTask, createQuizForTask,
};