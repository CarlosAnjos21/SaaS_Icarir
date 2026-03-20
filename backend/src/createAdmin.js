require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const senhaHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@gmail.com',
      senha: senhaHash,
      role: 'admin',
    },
    select: { id: true, nome: true, email: true, role: true },
  });

  console.log('✅ Admin criado:', admin);
}

createAdmin()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('❌ Erro ao criar admin:', error);
    prisma.$disconnect();
    process.exit(1);
  });
