const supabase = require('../config/supabaseClient');
const path = require('path');

/**
 * ─── Helper: Upload para Supabase Storage ──────────────────────────────────────
 * 
 * Funções auxiliares para fazer upload de arquivos para o Supabase Storage
 * em vez de armazenar localmente ou em memória.
 * 
 * Uso nos controllers:
 * const { uploadEvidenceFile, uploadProfilePhoto } = require('../helpers/supabaseUpload');
 * const url = await uploadEvidenceFile(file, userId, tarefaId);
 */

/**
 * Upload de arquivo de evidência de tarefa
 * @param {Object} file - Arquivo do Multer { buffer, originalname, mimetype }
 * @param {number} userId - ID do usuário que está fazendo upload
 * @param {number} tarefaId - ID da tarefa
 * @returns {Promise<string>} URL pública do arquivo no Supabase
 */
const uploadEvidenceFile = async (file, userId, tarefaId) => {
  if (!file) {
    throw new Error('Nenhum arquivo foi fornecido.');
  }

  try {
    // Caminho no bucket: evidences/userId/tarefaId/timestamp_filename
    const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    const filePath = `evidences/${userId}/tarefa_${tarefaId}/${fileName}`;

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('evidences')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false, // Não sobrescreve se já existir
      });

    if (error) {
      console.error('❌ Erro ao fazer upload para Supabase:', error);
      throw new Error(`Falha no upload: ${error.message}`);
    }

    // Retorna URL pública do arquivo
    const { data: publicData } = supabase.storage
      .from('evidences')
      .getPublicUrl(filePath);

    console.log(`✅ Upload realizado: ${filePath}`);
    return publicData.publicUrl;
  } catch (error) {
    console.error('❌ Erro ao fazer upload de evidência:', error);
    throw error;
  }
};

/**
 * Upload de foto de perfil do usuário
 * @param {Object} file - Arquivo do Multer { buffer, originalname, mimetype }
 * @param {number} userId - ID do usuário
 * @returns {Promise<string>} URL pública da foto no Supabase
 */
const uploadProfilePhoto = async (file, userId) => {
  if (!file) {
    throw new Error('Nenhum arquivo foi fornecido.');
  }

  try {
    // Caminho no bucket: perfis/userId/profile_photo
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `profile_${Date.now()}${ext}`;
    const filePath = `perfis/${userId}/${fileName}`;

    // Se já existe foto antiga, tenta deletar
    const { data: existingFiles } = await supabase.storage
      .from('images')
      .list(`perfis/${userId}`);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(
        (f) => `perfis/${userId}/${f.name}`
      );
      await supabase.storage.from('images').remove(filesToDelete);
    }

    // Upload da nova foto
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true, // Sobrescreve se já existir
      });

    if (error) {
      console.error('❌ Erro ao fazer upload de foto:', error);
      throw new Error(`Falha no upload: ${error.message}`);
    }

    // Retorna URL pública
    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    console.log(`✅ Foto de perfil atualizada: ${filePath}`);
    return publicData.publicUrl;
  } catch (error) {
    console.error('❌ Erro ao fazer upload de perfil:', error);
    throw error;
  }
};

/**
 * Delete arquivo do Supabase Storage
 * @param {string} filePath - Caminho completo do arquivo no bucket
 * @param {string} bucket - Nome do bucket ('evidences' ou 'images')
 * @returns {Promise<boolean>} true se deletado com sucesso
 */
const deleteFile = async (filePath, bucket = 'evidences') => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error('❌ Erro ao deletar arquivo:', error);
      return false;
    }

    console.log(`✅ Arquivo deletado: ${filePath}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error);
    return false;
  }
};

/**
 * Listar arquivos de um usuário
 * @param {number} userId - ID do usuário
 * @param {string} bucket - Nome do bucket
 * @param {string} folderPrefix - Prefixo da pasta (ex: 'evidences', 'perfis')
 * @returns {Promise<Array>} Lista de arquivos
 */
const listUserFiles = async (userId, bucket = 'evidences', folderPrefix = 'evidences') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(`${folderPrefix}/${userId}`);

    if (error) {
      console.error('❌ Erro ao listar arquivos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error);
    return [];
  }
};

module.exports = {
  uploadEvidenceFile,
  uploadProfilePhoto,
  deleteFile,
  listUserFiles,
};
