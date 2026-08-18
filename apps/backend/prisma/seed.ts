import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  {
    key: 'first_hunt',
    title: 'First Hunt',
    description: 'Save your first job posting.',
    icon: '🔎',
  },
  {
    key: 'first_blood',
    title: 'First Blood',
    description: 'Apply to your first job.',
    icon: '⚔',
  },
  {
    key: 'on_fire',
    title: 'On Fire',
    description: 'Reach a 3-day activity streak.',
    icon: '🔥',
  },
  {
    key: 'sharp_shooter',
    title: 'Sharp Shooter',
    description: 'Submit 10 applications.',
    icon: '🎯',
  },
  {
    key: 'interview_ready',
    title: 'Interview Ready',
    description: 'Land your first interview.',
    icon: '🤝',
  },
  {
    key: 'boss_defeated',
    title: 'Boss Defeated',
    description: 'Receive your first job offer.',
    icon: '🏆',
  },
] as const;

async function main() {
  const existingUser = await prisma.user.findFirst();
  if (!existingUser) {
    await prisma.user.create({ data: { name: 'Hunter' } });
  }

  const keys = achievements.map((a) => a.key);
  await prisma.achievement.deleteMany({ where: { key: { notIn: keys } } });

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: { ...achievement },
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
