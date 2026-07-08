const multer = require('multer');
const path = require('path');

/**
 * ─── Upload Middleware com Supabase Storage ───────────────────────────────────
 * 
 * Este middleware configura o Multer para:
 * 1. Armazenar arquivos em memória temporariamente
 * 2. Validar tipos de arquivo (imagens e PDFs para evidências)
 * 3. Limitar tamanho (5MB por arquivo)
 * 4. Preparar dados para upload no Supabase Storage
 * 
 * O upload real para Supabase acontece no controller (taskController.js)
 * Exemplo: await supabaseClient.storage.from('evidences').upload(path, file.buffer)
 */

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Tipos MIME permitidos: imagens e PDF para evidências
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  const isAllowed = allowedMimes.includes(file.mimetype);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Formato de arquivo não permitido. Use: JPG, PNG, GIF, WEBP ou PDF. Recebido: ${file.mimetype}`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // Máximo 10 arquivos por request
  },
});

module.exports = upload;
