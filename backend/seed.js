const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Rozpoczynam import danych z SQL...');
  const sqlPath = path.join(__dirname, 'backup.sql'); 
  const sql = fs.readFileSync(sqlPath, 'utf8');

  await prisma.$executeRawUnsafe(sql);
  console.log('Dane zaimportowane pomyślnie!');
}

main()
  .catch((e) => {
    console.error('Błąd podczas importu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
