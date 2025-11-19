import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateRankScores() {
  const client = await pool.connect();
  
  try {
    console.log('Updating rank scores...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../../api/src/db/update_rank_scores.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Execute the update
    const result = await client.query(sql);
    
    console.log('✓ Rank scores updated successfully');
    console.log(`  Rows affected: ${result.rowCount || 0}`);
  } catch (error) {
    console.error('✗ Failed to update rank scores:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateRankScores().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
