import pg from 'pg';
const { Pool } = pg;

// ============================================
// CREATE POSTGRES CONNECTION (NEON)
// ============================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ✅ Use Neon connection string
  ssl: {
    rejectUnauthorized: false, // ✅ Required for Neon
  },
});

// ============================================
// CONNECTION EVENTS
// ============================================

// When DB connects successfully
pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL database');
});

// Handle unexpected errors
pool.on('error', (err) => {
  console.error('❌ Unexpected DB error:', err);
  process.exit(-1);
});

// ============================================
// QUERY HELPER FUNCTION
// ============================================

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    console.log('📊 Query executed', {
      duration: `${duration}ms`,
      rows: result.rowCount,
    });

    return result;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
}

// ============================================
// EXPORTS
// ============================================

export { query, pool };