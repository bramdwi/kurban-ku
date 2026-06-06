const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Preparing production database schema ---');

// Check if DATABASE_URL is set (meaning we are deploying to production/Vercel)
if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL is not set. Skipping production schema conversion. Running local build...');
  process.exit(0);
}

console.log('DATABASE_URL detected. Converting schema and client to PostgreSQL...');

try {
  // 1. Update prisma/schema.prisma
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Replace sqlite datasource block with postgresql
  const sqliteDatasource = `datasource db {
  provider = "sqlite"
}`;

  const postgresDatasource = `datasource db {
  provider = "postgresql"
}`;

  if (schemaContent.includes(sqliteDatasource)) {
    schemaContent = schemaContent.replace(sqliteDatasource, postgresDatasource);
    fs.writeFileSync(schemaPath, schemaContent, 'utf8');
    console.log('Successfully updated prisma/schema.prisma to PostgreSQL provider.');
  } else {
    console.log('Prisma schema already uses PostgreSQL or is modified.');
  }

  // 2. Update src/lib/prisma.ts
  const prismaClientPath = path.join(__dirname, '../src/lib/prisma.ts');
  let prismaContent = fs.readFileSync(prismaClientPath, 'utf8');

  const sqliteClientBlock = `import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const adapter = new PrismaBetterSqlite3({
    url: 'file:./kurbanku.db',
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
};`;

  const postgresClientBlock = `import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  client.connect();
  const adapter = new PrismaPg(client);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
};`;

  if (prismaContent.includes(sqliteClientBlock)) {
    prismaContent = prismaContent.replace(sqliteClientBlock, postgresClientBlock);
    fs.writeFileSync(prismaClientPath, prismaContent, 'utf8');
    console.log('Successfully updated src/lib/prisma.ts to PostgreSQL PrismaPg adapter.');
  } else {
    console.log('src/lib/prisma.ts already uses PostgreSQL PrismaPg adapter.');
  }

  // 3. Regenerate Prisma Client
  console.log('Generating Prisma Client for PostgreSQL...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma Client generation completed successfully.');

} catch (error) {
  console.error('Error during production preparation:', error);
  process.exit(1);
}
