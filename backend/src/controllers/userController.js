// Importa o Prisma Client
const prisma = require("../config/prismaClient");

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
                email: true,
                role: true,
                pontos: true,
                foto_url: true,
                // 🛑 CORREÇÃO: Incluindo os dados da tabela Perfil
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

        // 🛑 CORREÇÃO: Achata o objeto para que o frontend leia 'curiosidades' diretamente
        const { perfil, ...usuarioBase } = user;

        const response = {
            ...usuarioBase,
            // Espalha os dados do perfil (se existir)
            ...(perfil || {}),

            // Mapeamento necessário: formata a data para string 'yyyy-mm-dd' esperada pelo input[type=date] do frontend
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

    // 🛑 CORREÇÃO: Adicionar 'email' na desestruturação dos dados do 'usuarios'
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
                    email, // 🛑 CORREÇÃO: Email agora é incluído na atualização
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

        // Opcional: Retorna o perfil atualizado para re-renderizar o frontend
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

// --- GET /api/users/:id/profile (Busca perfil público) ---
/**
 * @route   GET /api/users/:id/profile
 * @desc    Busca o perfil público de um usuário específico
 * @access  Privado (requer login)
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
};
