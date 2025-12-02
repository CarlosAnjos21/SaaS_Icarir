const prisma = require("../config/prismaClient");
const supabase = require("../config/supabaseClient");
// 🚨 Importar Multer (necessário para processar o upload de arquivos)
// Embora o middleware seja usado nas rotas, a função do controller assume que ele existe.

// --- GET /api/users/me (Retorna o perfil COMPLETO do usuário logado) ---
/**
 * @route   GET /api/users/me
 * @desc    Retorna os dados do usuário logado e seus dados de perfil (flattened)
 * @access  Privado
 */
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.usuarios.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nome: true,
                email: true, // Inclui email para o PRÓPRIO usuário
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
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Achata o objeto para que o frontend leia 'curiosidades' diretamente
        const { perfil, ...usuarioBase } = user;

        const response = {
            ...usuarioBase,
            ...(perfil || {}),

            // Mapeamento: formata a data para string 'yyyy-mm-dd'
            data_nascimento: perfil?.data_nascimento
                ? new Date(perfil.data_nascimento).toISOString().split('T')[0]
                : null,
        };

        res.json(response);
    } catch (error) {
        console.error("Erro ao buscar perfil do usuário logado:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

// -----------------------------------------------------------------------

// --- PUT /api/users/me (Atualiza o perfil do usuário logado) ---
/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado (JSON-only)
 * @access  Privado
 */
const updateMyProfile = async (req, res) => {
    const userId = req.user.id;

    // Dados da tabela 'usuarios'
    const { nome, foto_url, email } = req.body;

    // Dados da tabela 'perfis'
    const {
        curiosidades,
        linkedin_url,
        website,
        interesses,
        data_nascimento,
        telefone,
    } = req.body;

    // Dados preparados para o upsert do perfil
    const profileData = {
        curiosidades,
        linkedin_url,
        website,
        interesses,
        // Converte a string de data para objeto Date se existir
        data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
        telefone,
    };

    try {
        // Transação garante consistência entre as tabelas 'usuarios' e 'perfis'
        await prisma.$transaction([
            // Atualiza o usuário
            prisma.usuarios.update({
                where: { id: userId },
                data: {
                    nome,
                    foto_url,
                    email, // Email agora é incluído na atualização
                    data_atualizacao: new Date(),
                },
            }),

            // Cria ou atualiza o perfil (UPSERT)
            prisma.perfis.upsert({
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
            }),
        ]);

        // 🚨 Retorna o perfil atualizado
        const updatedUser = await getMyProfile(req, { json: (data) => data });
        return res.json(updatedUser);

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        // Retorna 400 se for erro de validação (ex: email já existe - P2002 é o código do Prisma)
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "O email fornecido já está em uso." });
        }
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

// -----------------------------------------------------------------------

// --- PUT /api/users/me/upload-foto ---
/**
 * @route   PUT /api/users/me/upload-foto
 * @desc    Atualiza a foto de perfil do usuário logado (requer Multer na rota)
 * @access  Privado
 */
const uploadProfilePhoto = async (req, res) => {
    const userId = req.user.id;
    const file = req.file; // Arquivo anexado pelo middleware Multer (Assumindo uso do Multer)
    const BUCKET_NAME = process.env.SUPABASE_BUCKET_PERFIL || 'seu-bucket-de-fotos'; // Usar variável de ambiente

    if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo de imagem fornecido." });
    }

    try {
        // 1. 📂 Define o caminho do arquivo no Supabase
        // Nome do arquivo: ID_TIMESTAMP.extensao
        const fileExtension = file.originalname.split('.').pop();
        const filename = `${userId}_${Date.now()}.${fileExtension}`;
        const filePath = `fotos_perfil/${filename}`;

        // 2. ⬆️ Envia o arquivo para o Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (uploadError) {
            console.error("Erro no upload do Supabase:", uploadError);
            return res.status(500).json({ error: "Falha ao enviar a imagem para o storage." });
        }

        // 3. 🌐 Obtém a URL pública
        const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        const foto_url = publicUrlData.publicUrl;

        // 4. 💾 Atualiza a URL no banco de dados (Prisma)
        await prisma.usuarios.update({
            where: { id: userId },
            data: {
                foto_url: foto_url,
                data_atualizacao: new Date(),
            },
        });

        // 5. Retorna sucesso com a nova URL
        return res.json({
            message: "Foto de perfil atualizada com sucesso!",
            foto_url: foto_url,
        });

    } catch (error) {
        console.error("Erro ao fazer upload da foto:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};


// -----------------------------------------------------------------------

// --- GET /api/users/:id/profile (Busca perfil público) ---
/**
 * @route   GET /api/users/:id/profile
 * @desc    Busca o perfil público de outro usuário
 * @access  Público (ou protegido se preferir)
 */
const getUserProfileById = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "ID de usuário inválido." });
        }

        // Busca o usuário e inclui dados do perfil (substitui o LEFT JOIN)
        const user = await prisma.usuarios.findFirst({
            where: {
                id: userId,
                ativo: true,
                role: "user",
            },
            select: {
                id: true,
                nome: true,
                foto_url: true,
                pontos: true,
                // 🚨 GARANTINDO PRIVACIDADE: Não inclua o email de outros usuários
                perfil: {
                    select: {
                        curiosidades: true,
                        linkedin_url: true,
                        website: true,
                        interesses: true,
                        // Data de nascimento e telefone são privados
                    },
                },
            },
        });

        if (!user) {
            return res
                .status(404)
                .json({ error: "Perfil de usuário não encontrado ou inativo." });
        }

        // Achata o objeto para manter o mesmo formato da resposta SQL anterior
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
    updateMyProfile,
    getUserProfileById,
    getMyProfile,
    // 🚨 Exportação da nova função
    uploadProfilePhoto, 
};