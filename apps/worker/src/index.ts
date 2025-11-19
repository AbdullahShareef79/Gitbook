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
    console.log('[Rank Worker] Starting rank score update...');
    const startTime = Date.now();

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../../api/src/db/update_rank_scores.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Execute the update
    const result = await client.query(sql);
    
    const duration = Date.now() - startTime;
    console.log(`[Rank Worker] Rank scores updated successfully in ${duration}ms`);
    console.log(`[Rank Worker] Rows affected: ${result.rowCount || 0}`);
  } catch (error) {
    console.error('[Rank Worker] Failed to update rank scores:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  console.log('[Rank Worker] Starting rank score worker...');
  console.log('[Rank Worker] Database:', process.env.DATABASE_URL?.split('@')[1]?.split('?')[0]);

  // Run immediately on startup
  try {
    await updateRankScores();
  } catch (error) {
    console.error('[Rank Worker] Initial update failed:', error);
  }

  // Run every hour (3600000 ms)
  const intervalMs = parseInt(process.env.RANK_UPDATE_INTERVAL_MS || '3600000');
  console.log(`[Rank Worker] Scheduling updates every ${intervalMs / 1000 / 60} minutes`);

  setInterval(async () => {
    try {
      await updateRankScores();
    } catch (error) {
      console.error('[Rank Worker] Scheduled update failed:', error);
      // Continue running even if an update fails
    }
  }, intervalMs);

  console.log('[Rank Worker] Worker is running. Press Ctrl+C to stop.');
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Rank Worker] SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Rank Worker] SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

main().catch((error) => {
  console.error('[Rank Worker] Fatal error:', error);
  process.exit(1);
});
