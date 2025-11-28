const prisma = require("../config/prismaClient");
const supabase = require("../config/supabaseClient");

/**
 * @route   GET /api/users/me
 * @desc    Retorna os dados do usuário logado (incluindo perfil)
 * @access  Privado
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Busca na tabela 'Usuario' (prisma.usuario)
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        pontos: true,
        foto_url: true,
        perfil: {
          select: {
            curiosidades: true,
            linkedin_url: true,
            website: true,
            interesses: true,
            data_nascimento: true,
            telefone: true,
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Achata o objeto para facilitar o uso no frontend
    const { perfil, ...usuarioBase } = user;
    const response = {
      ...usuarioBase,
      ...(perfil || {}),
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado (com Upload)
 * @access  Privado
 */
const updateMyProfile = async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  // --- DEBUG ---
  console.log("=== INICIANDO UPDATE DE PERFIL ===");
  console.log("Usuário ID:", userId);
  console.log("Body recebido:", req.body);
  console.log("Arquivo recebido:", file ? file.originalname : "NENHUM ARQUIVO (req.file is undefined)");

  // Extrai os campos do corpo da requisição (FormData)
  const {
    nome,
    curiosidades,
    linkedin_url,
    website,
    interesses,
    data_nascimento,
    telefone,
  } = req.body;

  let publicUrl = null;

  try {
    // --- 1. LÓGICA DE UPLOAD SUPABASE ---
    if (file) {
      // Gera um nome único para o arquivo
      const fileExt = file.mimetype.split('/')[1] || 'jpg';
      const fileName = `avatars/${userId}-${Date.now()}.${fileExt}`;

      // Upload para o bucket 'images'
      const { error: uploadError } = await supabase
        .storage
        .from('images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (uploadError) {
        console.error("Erro Supabase:", uploadError);
        throw new Error("Falha ao fazer upload da imagem.");
      }

      // Pega a URL pública
      const { data: urlData } = supabase
        .storage
        .from('images')
        .getPublicUrl(fileName);

      publicUrl = urlData.publicUrl;
    }

    // --- 2. TRANSAÇÃO NO BANCO DE DADOS ---
    await prisma.$transaction(async (tx) => {
      
      // Atualiza tabela 'Usuario'
      await tx.usuario.update({
        where: { id: userId },
        data: {
          ...(nome && { nome }), // Atualiza nome se vier na requisição
          ...(publicUrl && { foto_url: publicUrl }), // Atualiza foto se tiver nova URL
          data_atualizacao: new Date(),
        },
      });

      // Prepara dados para tabela 'Perfil'
      const profileData = {
        curiosidades,
        linkedin_url,
        website,
        interesses,
        // Converte string de data para objeto Date se existir
        data_nascimento: data_nascimento && data_nascimento !== 'null' ? new Date(data_nascimento) : undefined,
        telefone,
      };

      // Remove campos undefined para não sobrescrever dados existentes com nada
      Object.keys(profileData).forEach(key => profileData[key] === undefined && delete profileData[key]);

      // Se houver dados de perfil para atualizar
      if (Object.keys(profileData).length > 0) {
        // Upsert na tabela 'Perfil'
        await tx.perfil.upsert({
          where: { usuario_id: userId },
          update: {
            ...profileData,
            data_atualizacao: new Date(),
          },
          create: {
            ...profileData,
            usuario_id: userId,
            data_criacao: new Date(),
            data_atualizacao: new Date(),
          },
        });
      }
    });

    // --- 3. RETORNO ---
    // Busca os dados atualizados para devolver ao frontend
    const updatedUser = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, foto_url: true, email: true }
    });

    res.json(updatedUser);

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro interno: " + error.message });
  }
};

/**
 * @route   GET /api/users/:id/profile
 * @desc    Busca o perfil público de outro usuário
 */
const getUserProfileById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const user = await prisma.usuario.findFirst({
      where: {
        id: userId,
        ativo: true,
        role: "participante", // Usando o enum 'participante' do seu schema
      },
      select: {
        id: true,
        nome: true,
        foto_url: true,
        pontos: true,
        perfil: {
          select: {
            curiosidades: true,
            linkedin_url: true,
            website: true,
            interesses: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Perfil não encontrado." });
    }

    const { perfil, ...usuarioBase } = user;
    const response = {
      ...usuarioBase,
      ...(perfil || {}),
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar perfil público:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getUserProfileById,
};