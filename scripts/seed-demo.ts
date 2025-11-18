// Node 18+ has native fetch
const API_URL = process.env.API_URL || 'http://localhost:4000';

// Popular open-source repos to seed
const REPOS = [
  'vercel/next.js',
  'facebook/react',
  'microsoft/vscode',
  'withastro/astro',
  'tailwindlabs/tailwindcss',
  'vuejs/core',
  'sveltejs/svelte',
  'denoland/deno',
  'golang/go',
  'rust-lang/rust',
  'nodejs/node',
  'django/django',
  'rails/rails',
  'laravel/laravel',
  'nestjs/nest',
  'prisma/prisma',
  'supabase/supabase',
  'vercel/hyper',
  'electron/electron',
  'reduxjs/redux',
];

interface CreateProjectResponse {
  id: string;
  name: string;
}

async function seedDemo() {
  console.log('🌱 Starting demo seed...\n');

  // You'll need to manually get a JWT token from your dev environment
  // Run: POST /auth/login with valid credentials and copy the token
  const JWT_TOKEN = process.env.JWT_TOKEN;
  
  if (!JWT_TOKEN) {
    console.error('❌ JWT_TOKEN environment variable is required');
    console.log('Get a token by signing in and copying from dev tools → Application → Cookies → next-auth.session-token');
    process.exit(1);
  }

  let successCount = 0;
  let failCount = 0;

  for (const repo of REPOS) {
    try {
      console.log(`📦 Creating project: ${repo}...`);
      
      const [owner, name] = repo.split('/');
      
      const response = await fetch(`${API_URL}/projects/from-github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JWT_TOKEN}`,
        },
        body: JSON.stringify({
          owner,
          repo: name,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const project = (await response.json()) as CreateProjectResponse;
      console.log(`   ✅ Created: ${project.name} (ID: ${project.id})`);
      successCount++;

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`   ❌ Failed: ${error}`);
      failCount++;
    }
  }

  console.log(`\n🎉 Seed complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
}

seedDemo().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
