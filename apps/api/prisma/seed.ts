import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      handle: 'alice',
      email: 'alice@example.com',
      name: 'Alice Developer',
      headline: 'Full-stack developer passionate about AI',
      skills: ['TypeScript', 'React', 'Node.js', 'Python'],
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      handle: 'bob',
      email: 'bob@example.com',
      name: 'Bob Engineer',
      headline: 'Backend engineer & ML enthusiast',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    },
  });

  console.log('Created users:', { user1, user2 });

  // Create demo projects
  const project1 = await prisma.project.upsert({
    where: { githubUrl: 'https://github.com/alice/awesome-project' },
    update: {},
    create: {
      title: 'Awesome Project',
      githubUrl: 'https://github.com/alice/awesome-project',
      tags: ['typescript', 'react', 'next.js'],
      summary: 'A modern web application built with Next.js and TypeScript',
      ownerId: user1.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { githubUrl: 'https://github.com/bob/ml-toolkit' },
    update: {},
    create: {
      title: 'ML Toolkit',
      githubUrl: 'https://github.com/bob/ml-toolkit',
      tags: ['python', 'machine-learning', 'pytorch'],
      summary: 'A collection of ML utilities and helpers',
      ownerId: user2.id,
    },
  });

  console.log('Created projects:', { project1, project2 });

  // Create demo posts
  const post1 = await prisma.post.create({
    data: {
      type: 'REPO_CARD',
      authorId: user1.id,
      content: {
        projectId: project1.id,
        title: 'Awesome Project',
        summary: ['Modern architecture', 'Type-safe', 'High performance'],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      type: 'NOTE',
      authorId: user2.id,
      content: {
        text: 'Just shipped a new feature in ML Toolkit! Check it out.',
      },
    },
  });

  console.log('Created posts:', { post1, post2 });

  // Create follow relationship
  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followeeId: user2.id,
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
