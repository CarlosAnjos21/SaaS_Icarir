const prisma = require('../config/prismaClient');
const supabase = require('../config/supabaseClient');

const BUCKET_NAME = process.env.SUPABASE_BUCKET_PERFIL || 'images';

const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, nome: true, email: true, role: true, pontos: true, foto_url: true,
        perfil: {
          select: { curiosidades: true, linkedin_url: true, website: true, interesses: true, data_nascimento: true, telefone: true },
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const { perfil, ...base } = user;
    res.json({
      ...base,
      ...(perfil || {}),
      data_nascimento: perfil?.data_nascimento
        ? new Date(perfil.data_nascimento).toISOString().split('T')[0]
        : null,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const updateMyProfile = async (req, res) => {
  const userId = req.user.id;
  const file = req.file;
  const { nome, email, curiosidades, linkedin_url, website, interesses, data_nascimento, telefone } = req.body;
  let { foto_url } = req.body;

  try {
    // Upload de foto se arquivo enviado
    if (file) {
      const ext = file.originalname.split('.').pop();
      const path = `avatars/${userId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file.buffer, { contentType: file.mimetype, upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
        foto_url = data.publicUrl;
      } else {
        console.error('Erro no upload Supabase:', uploadError);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: userId },
        data: {
          ...(nome && { nome }),
          ...(email && { email }),
          ...(foto_url && { foto_url }),
        },
      });

      const profileData = {
        ...(curiosidades !== undefined && { curiosidades }),
        ...(linkedin_url !== undefined && { linkedin_url }),
        ...(website !== undefined && { website }),
        ...(interesses !== undefined && { interesses }),
        ...(telefone !== undefined && { telefone }),
        ...(data_nascimento && data_nascimento !== 'null' && { data_nascimento: new Date(data_nascimento) }),
      };

      if (Object.keys(profileData).length > 0) {
        await tx.perfil.upsert({
          where: { usuario_id: userId },
          update: profileData,
          create: { ...profileData, usuario_id: userId },
        });
      }
    });

    const updated = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { perfil: true },
    });

    const { perfil, senha, ...base } = updated; // remove senha do response
    res.json({ ...base, ...(perfil || {}) });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'E-mail já está em uso.' });
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const uploadProfilePhoto = async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

  try {
    const ext = file.originalname.split('.').pop();
    const path = `avatars/${userId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file.buffer, { contentType: file.mimetype, upsert: true });

    if (uploadError) {
      console.error('Erro Supabase:', uploadError);
      return res.status(500).json({ error: 'Falha ao enviar imagem.' });
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    const foto_url = data.publicUrl;

    await prisma.usuario.update({ where: { id: userId }, data: { foto_url } });

    res.json({ message: 'Foto atualizada com sucesso!', foto_url });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getUserProfileById = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const user = await prisma.usuario.findFirst({
      where: { id: userId, ativo: true },
      select: {
        id: true, nome: true, foto_url: true, pontos: true,
        perfil: { select: { curiosidades: true, linkedin_url: true, website: true, interesses: true } },
      },
    });

    if (!user) return res.status(404).json({ error: 'Perfil não encontrado.' });

    const { perfil, ...base } = user;
    res.json({ ...base, ...(perfil || {}) });
  } catch (error) {
    console.error('Erro ao buscar perfil público:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { getMyProfile, updateMyProfile, uploadProfilePhoto, getUserProfileById };