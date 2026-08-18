import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  {
    key: 'FIRST_JOB_SAVED',
    title: 'First Blood',
    description: 'Save your first job posting.',
    icon: 'pin',
  },
  {
    key: 'FIRST_APPLICATION',
    title: 'In the Game',
    description: 'Submit your first application.',
    icon: 'send',
  },
  {
    key: 'FIRST_INTERVIEW',
    title: 'Face to Face',
    description: 'Land your first interview.',
    icon: 'handshake',
  },
  {
    key: 'FIRST_OFFER',
    title: 'Winner Winner',
    description: 'Receive your first job offer.',
    icon: 'trophy',
  },
  {
    key: 'STREAK_3',
    title: 'On a Roll',
    description: 'Reach a 3-day activity streak.',
    icon: 'flame',
  },
  {
    key: 'STREAK_7',
    title: 'Unstoppable',
    description: 'Reach a 7-day activity streak.',
    icon: 'bolt',
  },
  {
    key: 'LEVEL_5',
    title: 'Rising Star',
    description: 'Reach level 5.',
    icon: 'star',
  },
  {
    key: 'LEVEL_10',
    title: 'Seasoned Pro',
    description: 'Reach level 10.',
    icon: 'gem',
  },
  {
    key: 'QUESTS_10',
    title: 'Quest Master',
    description: 'Complete 10 quests.',
    icon: 'map',
  },
] as const;

async function main() {
  const existingUser = await prisma.user.findFirst();
  if (!existingUser) {
    await prisma.user.create({ data: { name: 'Hunter' } });
  }

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: { ...achievement },
    });
  }
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
