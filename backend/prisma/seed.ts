import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Demo seed. Creates a couple of users and a few posts so the API can be
 * exercised locally. Run with: npm run prisma:seed
 */
async function main() {
  const passwordHash = await bcrypt.hash('Password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      firstName: 'Alice',
      lastName: 'Example',
      email: 'alice@example.com',
      passwordHash,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      firstName: 'Bob',
      lastName: 'Example',
      email: 'bob@example.com',
      passwordHash,
    },
  });

  await prisma.post.createMany({
    data: [
      {
        authorId: alice.id,
        content: 'Hello world from Alice!',
        visibility: 'PUBLIC',
      },
      {
        authorId: bob.id,
        content: 'Bob secret note',
        visibility: 'PRIVATE',
      },
    ],
  });

  console.log('Seed complete', { alice: alice.id, bob: bob.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
