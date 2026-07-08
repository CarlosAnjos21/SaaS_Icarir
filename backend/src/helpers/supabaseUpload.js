const supabase = require('../config/supabaseClient');
const path = require('path');

const uploadEvidenceFile = async (file, userId, tarefaId) => {
  if (!file) {
    throw new Error('Nenhum arquivo foi fornecido.');
  }

  try {
    const sanitizedName = file.originalname.replace(/\s+/g, '_');
    const fileName = `${Date.now()}_${sanitizedName}`;
    const filePath = `evidences/${userId}/tarefa_${tarefaId}/${fileName}`;

    const { error } = await supabase.storage
      .from('evidences')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Falha no upload: ${error.message}`);
    }

    const { data } = supabase.storage
      .from('evidences')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload de evidência:', error);
    throw error;
  }
};

const uploadProfilePhoto = async (file, userId) => {
  if (!file) {
    throw new Error('Nenhum arquivo foi fornecido.');
  }

  try {
    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `profile_${Date.now()}${extension}`;
    const filePath = `perfis/${userId}/${fileName}`;

    const { data: existingFiles } = await supabase.storage
      .from('images')
      .list(`perfis/${userId}`);

    if (existingFiles?.length) {
      const filesToDelete = existingFiles.map(
        (existingFile) => `perfis/${userId}/${existingFile.name}`
      );

      await supabase.storage.from('images').remove(filesToDelete);
    }

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Falha no upload: ${error.message}`);
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload da foto de perfil:', error);
    throw error;
  }
};

const deleteFile = async (filePath, bucket = 'evidences') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
};

const listUserFiles = async (
  userId,
  bucket = 'evidences',
  folderPrefix = 'evidences'
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(`${folderPrefix}/${userId}`);

    if (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return [];
  }
};

module.exports = {
  uploadEvidenceFile,
  uploadProfilePhoto,
  deleteFile,
  listUserFiles,
};