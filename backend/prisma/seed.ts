import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test users

  try {
    const user1 = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: await bcrypt.hash('password', 12),
        name: 'Test User 1',
        company: 'Test Company',
        instructor: 'someone',
        start_date: null,
        end_date: null,
        workedHours: 0,
        workedDays: 0,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'user2@example.com',
        password: await bcrypt.hash('password', 12),
        name: 'Test User 2',
        company: 'Test Company',
        instructor: 'someone',
        start_date: null,
        end_date: null,
        workedHours: 0,
        workedDays: 0,
      },
    });
    console.log('Created users:', user1, user2);
    // Create test projects
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
}

main()
  .then(async () => {
    console.log('Seeding completed successfully');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
