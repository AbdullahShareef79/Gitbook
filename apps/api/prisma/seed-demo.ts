import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        email: 'alice@example.com',
        handle: 'alice_dev',
        name: 'Alice Johnson',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        headline: 'Full-stack developer passionate about React and Node.js',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        email: 'bob@example.com',
        handle: 'bob_codes',
        name: 'Bob Smith',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        headline: 'Backend engineer | Python enthusiast | Open source contributor',
        skills: ['Python', 'Django', 'Docker', 'AWS'],
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'charlie@example.com' },
      update: {},
      create: {
        email: 'charlie@example.com',
        handle: 'charlie_tech',
        name: 'Charlie Davis',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
        headline: 'DevOps wizard | Kubernetes expert | Cloud architect',
        skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'TypeScript'],
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'diana@example.com' },
      update: {},
      create: {
        email: 'diana@example.com',
        handle: 'diana_designs',
        name: 'Diana Martinez',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
        headline: 'Frontend developer & UI/UX designer | Vue.js lover',
        skills: ['Vue.js', 'CSS', 'Figma', 'TypeScript'],
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'evan@example.com' },
      update: {},
      create: {
        email: 'evan@example.com',
        handle: 'evan_ai',
        name: 'Evan Chen',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evan',
        headline: 'ML Engineer | AI researcher | Building the future',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'React'],
        role: 'USER',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create follows (social graph)
  await prisma.follow.createMany({
    data: [
      { followerId: users[0].id, followeeId: users[1].id },
      { followerId: users[0].id, followeeId: users[2].id },
      { followerId: users[1].id, followeeId: users[0].id },
      { followerId: users[1].id, followeeId: users[3].id },
      { followerId: users[2].id, followeeId: users[0].id },
      { followerId: users[2].id, followeeId: users[4].id },
      { followerId: users[3].id, followeeId: users[1].id },
      { followerId: users[4].id, followeeId: users[2].id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created follow relationships');

  // Create posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        type: 'NOTE',
        authorId: users[0].id,
        content: {
          text: 'Just deployed my first Next.js 14 app with server components! The performance is incredible. @bob_codes you should check this out! 🚀',
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.post.create({
      data: {
        type: 'NOTE',
        authorId: users[1].id,
        content: {
          text: 'Hot take: Python type hints have made my code 10x more maintainable. Anyone else feel the same?',
        },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
    }),
    prisma.post.create({
      data: {
        type: 'NOTE',
        authorId: users[2].id,
        content: {
          text: 'Finally got our Kubernetes cluster running smoothly in production! Autoscaling is working like a charm. Happy to answer questions! 💪',
        },
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    }),
    prisma.post.create({
      data: {
        type: 'NOTE',
        authorId: users[3].id,
        content: {
          text: 'Created a new CSS animation library! Check it out at github.com/diana/css-magic ✨ Would love feedback from @alice_dev',
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      },
    }),
    prisma.post.create({
      data: {
        type: 'NOTE',
        authorId: users[4].id,
        content: {
          text: 'Training a new transformer model for code completion. Preliminary results look promising! 🤖',
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
    }),
  ]);

  console.log(`✅ Created ${posts.length} posts`);

  // Create mentions
  await Promise.all([
    prisma.mention.create({
      data: {
        postId: posts[0].id,
        mentionedUserId: users[1].id,
        createdById: users[0].id,
      },
    }),
    prisma.mention.create({
      data: {
        postId: posts[3].id,
        mentionedUserId: users[0].id,
        createdById: users[3].id,
      },
    }),
  ]);

  console.log('✅ Created mentions');

  // Create interactions (likes, comments, bookmarks)
  // Likes for post 0
  await prisma.postInteraction.createMany({
    data: [
      { postId: posts[0].id, userId: users[1].id, kind: 'LIKE' },
      { postId: posts[0].id, userId: users[2].id, kind: 'LIKE' },
      { postId: posts[0].id, userId: users[3].id, kind: 'LIKE' },
      { postId: posts[0].id, userId: users[4].id, kind: 'LIKE' },
    ],
    skipDuplicates: true,
  });

  // Comments for post 0
  await prisma.postInteraction.create({
    data: {
      postId: posts[0].id,
      userId: users[1].id,
      kind: 'COMMENT',
      content: 'This is awesome! I need to try this ASAP 🔥',
    },
  });

  await prisma.postInteraction.create({
    data: {
      postId: posts[0].id,
      userId: users[2].id,
      kind: 'COMMENT',
      content: '@alice_dev What hosting are you using? Vercel?',
    },
  });

  // Bookmark for post 0
  await prisma.postInteraction.create({
    data: {
      postId: posts[0].id,
      userId: users[3].id,
      kind: 'BOOKMARK',
    },
  });

  // Post 1 interactions
  await prisma.postInteraction.createMany({
    data: [
      { postId: posts[1].id, userId: users[0].id, kind: 'LIKE' },
      { postId: posts[1].id, userId: users[4].id, kind: 'LIKE' },
    ],
    skipDuplicates: true,
  });

  await prisma.postInteraction.create({
    data: {
      postId: posts[1].id,
      userId: users[0].id,
      kind: 'COMMENT',
      content: 'Absolutely! Type hints are a game changer',
    },
  });

  // Post 2 interactions (trending!)
  await prisma.postInteraction.createMany({
    data: [
      { postId: posts[2].id, userId: users[0].id, kind: 'LIKE' },
      { postId: posts[2].id, userId: users[1].id, kind: 'LIKE' },
      { postId: posts[2].id, userId: users[4].id, kind: 'LIKE' },
      { postId: posts[2].id, userId: users[0].id, kind: 'BOOKMARK' },
      { postId: posts[2].id, userId: users[1].id, kind: 'BOOKMARK' },
    ],
    skipDuplicates: true,
  });

  await prisma.postInteraction.create({
    data: {
      postId: posts[2].id,
      userId: users[1].id,
      kind: 'COMMENT',
      content: 'Can you share your autoscaling config?',
    },
  });

  await prisma.postInteraction.create({
    data: {
      postId: posts[2].id,
      userId: users[4].id,
      kind: 'COMMENT',
      content: 'This is really helpful, thanks!',
    },
  });

  // Post 3 interactions
  await prisma.postInteraction.createMany({
    data: [
      { postId: posts[3].id, userId: users[0].id, kind: 'LIKE' },
      { postId: posts[3].id, userId: users[1].id, kind: 'LIKE' },
      { postId: posts[3].id, userId: users[2].id, kind: 'LIKE' },
    ],
    skipDuplicates: true,
  });

  await prisma.postInteraction.create({
    data: {
      postId: posts[3].id,
      userId: users[0].id,
      kind: 'COMMENT',
      content: 'Looks amazing! Will definitely check it out 😍',
    },
  });

  // Post 4 interactions
  await prisma.postInteraction.createMany({
    data: [
      { postId: posts[4].id, userId: users[2].id, kind: 'LIKE' },
      { postId: posts[4].id, userId: users[3].id, kind: 'LIKE' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created interactions');

  // Create conversations and messages
  const conversation1 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: users[0].id },
          { userId: users[1].id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation1.id,
        senderId: users[0].id,
        content: 'Hey Bob! Did you see my Next.js post?',
        createdAt: new Date(Date.now() - 90 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderId: users[1].id,
        content: 'Yes! It looks really cool. I want to migrate our app to Next.js 14',
        createdAt: new Date(Date.now() - 85 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderId: users[0].id,
        content: 'I can help you with that! Let me know when you want to start',
        createdAt: new Date(Date.now() - 80 * 60 * 1000),
      },
    ],
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: users[2].id },
          { userId: users[1].id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation2.id,
        senderId: users[1].id,
        content: 'Charlie, can you share that K8s autoscaling config?',
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderId: users[2].id,
        content: 'Sure! I\'ll send you the YAML files',
        createdAt: new Date(Date.now() - 40 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created conversations and messages');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Posts: ${posts.length}`);
  console.log(`   Interactions: 27+`);
  console.log(`   Messages: 5 across 2 conversations`);
  console.log(`   Mentions: 2`);
  console.log('\n🔐 You can sign in with any of these emails:');
  users.forEach(u => console.log(`   - ${u.email} (@${u.handle})`));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
