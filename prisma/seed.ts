import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./kurbanku.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 KurbanKu SaaS - No seed data needed.');
  console.log('📝 Register a new account at the landing page to get started.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
