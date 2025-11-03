const { PrismaClient } = require('@prisma/client');

// Instancia o Prisma Client
const prisma = new PrismaClient();

// Exporta a instância
module.exports = prisma;