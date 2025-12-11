const express = require("express");
const path = require("path");
const fs = require('fs');

// 1. CORREÇÃO CRÍTICA DO DOTENV: Forçar busca do .env na pasta atual do arquivo
const envFile = path.join(__dirname, "../.env");
if (fs.existsSync(envFile)) {
    require("dotenv").config({ path: envFile });
    console.log(`✅ .env carregado de: ${envFile}`);
} else {
    require("dotenv").config(); // Tenta o padrão
    console.log("⚠️ .env não encontrado na pasta do script, tentando padrão...");
}

const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require('multer'); 
const nodemailer = require('nodemailer'); 
const setupSwagger = require("./swagger");

// ✅ MANTER: Importações necessárias para as rotas /auth e /users
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); 

const app = express();
app.use(express.json());
app.use(cookieParser());
setupSwagger(app); // 1. Configuração do Swagger

// ✅ Configuração única do CORS para o frontend (Vite)
app.use(
  cors({
    origin: "http://localhost:5173", // porta correta do front-end com Vite
    credentials: true,
  })
);

// --- INÍCIO DA LÓGICA DE E-MAIL (RAM-TO-SMTP) ---

// Configuração do Multer para Memória RAM (não salva em disco)
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ 
    storage: memoryStorage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB Hard Limit
});

// Verificação de Variáveis de Ambiente para E-mail
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

let transporter = null;

// Lógica de proteção: Só cria o transporter se tiver credenciais
if (!smtpUser || !smtpPass) {
    console.error("❌ ERRO CRÍTICO: SMTP_USER ou SMTP_PASS estão vazios. Verifique o arquivo .env!");
} else {
    // Configuração do Nodemailer
    transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false, 
        auth: {
            user: smtpUser,
            pass: smtpPass
        },
        debug: true, 
        logger: true 
    });

    // Teste de conexão
    transporter.verify(function (error, success) {
        if (error) {
            console.error("❌ ERRO DE CONEXÃO SMTP (Login falhou):", error.message);
        } else {
            console.log("✅ Servidor SMTP conectado com: " + smtpUser);
        }
    });
}

// Rota de Envio de Contrato (Sem persistência)
app.post('/api/send-contract', uploadMemory.single('contract'), async (req, res) => {
    try {
        // Bloqueio se não houver configuração
        if (!transporter) {
            return res.status(500).json({ error: 'Servidor de e-mail não configurado. Verifique os logs do Backend.' });
        }

        if (!req.file) {
            console.warn("⚠️ Tentativa de envio sem arquivo.");
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }

        console.log(`📩 Iniciando envio de: ${req.file.originalname} (${req.file.size} bytes)`);

        const mailOptions = {
            from: `"Sistema" <${smtpUser}>`,
            to: process.env.DESTINATION_EMAIL || smtpUser,
            subject: `Novo Contrato: ${req.file.originalname}`,
            text: 'Segue anexo o contrato enviado pelo sistema.',
            attachments: [
                {
                    filename: req.file.originalname,
                    content: req.file.buffer, // Buffer da RAM
                    contentType: req.file.mimetype
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ E-mail enviado com sucesso! ID:', info.messageId);
        
        res.status(200).json({ message: 'Contrato enviado com sucesso.', messageId: info.messageId });
    } catch (error) {
        console.error('❌ ERRO FATAL NO ENVIO:', error);
        res.status(500).json({ 
            error: 'Falha ao enviar e-mail.', 
            details: error.message, 
            code: error.code 
        });
    }
});
// --- FIM DA LÓGICA DE E-MAIL ---


// ✅ Rota de Autenticação e Usuários
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ✅ Rotas da API principal (se o mainRouter incluir outras rotas)
const mainRouter = require("./routes/index");
app.use("/api", mainRouter);

// ✅ Redirecionar a raiz para o front-end
app.get("/", (req, res) => {
  res.redirect("http://localhost:5173");
});

// Garantir que a pasta de uploads exista antes de iniciar o servidor (Lógica original mantida)
try {
  const uploadsPath = path.join(__dirname, '..', 'uploads', 'evidences');
  fs.mkdirSync(uploadsPath, { recursive: true });
  // opcional: também garantir a pasta uploads (pai)
  fs.mkdirSync(path.join(__dirname, '..', 'uploads'), { recursive: true });
} catch (err) {
  console.error('Erro criando pasta de uploads:', err);
}

// ✅ Servir arquivos estáticos (imagens enviadas)
// Servir uploads estáticos (permitir acesso via /uploads/...)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


// ✅ Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});