const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dev:dev@localhost:5432/devsocial',
});

async function applyMigrations() {
  const migrationsDir = path.join(__dirname, '../apps/api/src/db/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found');
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Applying ${file}...`);
    try {
      await pool.query(sql);
      console.log(`✓ ${file} applied successfully`);
    } catch (error) {
      console.error(`✗ Error applying ${file}:`, error.message);
      // Continue with other migrations
    }
  }

  await pool.end();
  console.log('Migrations complete');
}

applyMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
