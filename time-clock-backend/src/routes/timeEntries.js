// time-clock-backend/src/routes/timeEntries.js
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = express.Router();
const pool = new Pool({
  user: process.env.DB_USER || 'kwamebaffoe',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'timeclock',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// POST - Create time entry (Clock In/Out/Break)
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { action, timestamp, userId = 1, category = 'regular', notes = '' } = req.body;
    console.log('New time entry:', { action, timestamp, userId, category, notes });

    switch (action) {
      case 'IN':
        const shiftResult = await client.query(
          `INSERT INTO shifts (user_id, category, start_time, notes) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id`,
          [userId, category, timestamp, notes]
        );
        
        await client.query(
          `INSERT INTO time_entries (user_id, shift_id, action, timestamp, notes) 
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, shiftResult.rows[0].id, action, timestamp, notes]
        );
        break;

      case 'OUT':
        const activeShift = await client.query(
          `SELECT id FROM shifts 
           WHERE user_id = $1 AND end_time IS NULL 
           ORDER BY start_time DESC LIMIT 1`,
          [userId]
        );

        if (activeShift.rows.length > 0) {
          const shiftId = activeShift.rows[0].id;
          await client.query(
            `UPDATE shifts 
             SET end_time = $1, notes = CASE WHEN $2 <> '' THEN $2 ELSE notes END 
             WHERE id = $3`,
            [timestamp, notes, shiftId]
          );

          await client.query(
            `INSERT INTO time_entries (user_id, shift_id, action, timestamp, notes) 
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, shiftId, action, timestamp, notes]
          );
        }
        break;

      case 'BREAK_START':
      case 'BREAK_END':
        await handleBreakAction(client, action, userId, timestamp);
        break;

      default:
        throw new Error('Invalid action type');
    }

    await client.query('COMMIT');
    res.status(201).json({ 
      success: true, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating time entry:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// GET - Retrieve time entries with filters
router.get('/', async (req, res) => {
  try {
    const { userId = 1, filter = 'week', startDate, endDate } = req.query;
    
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = 'AND timestamp BETWEEN $2 AND $3';
    } else if (filter === 'week') {
      dateFilter = 'AND timestamp >= NOW() - INTERVAL \'7 days\'';
    } else if (filter === 'month') {
      dateFilter = 'AND timestamp >= NOW() - INTERVAL \'30 days\'';
    }

    const query = `
      SELECT 
        te.id, 
        te.action, 
        te.timestamp, 
        te.notes,
        s.category, 
        s.total_hours, 
        s.total_break_time,
        s.start_time as shift_start,
        s.end_time as shift_end
      FROM time_entries te
      JOIN shifts s ON te.shift_id = s.id
      WHERE te.user_id = $1 ${dateFilter}
      ORDER BY te.timestamp DESC
    `;

    const params = startDate && endDate 
      ? [userId, startDate, endDate]
      : [userId];

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Latest time entry status
router.get('/status', async (req, res) => {
  try {
    const { userId = 1 } = req.query;
    const result = await pool.query(
      `SELECT 
        te.action, 
        te.timestamp,
        s.category,
        s.start_time as shift_start
      FROM time_entries te
      JOIN shifts s ON te.shift_id = s.id
      WHERE te.user_id = $1
      ORDER BY te.timestamp DESC
      LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.json({ status: 'OUT' });
    } else {
      const lastEntry = result.rows[0];
      res.json({
        status: lastEntry.action,
        timestamp: lastEntry.timestamp,
        category: lastEntry.category,
        shiftStart: lastEntry.shift_start
      });
    }
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function for break handling
async function handleBreakAction(client, action, userId, timestamp) {
  if (action === 'BREAK_START') {
    const activeShift = await client.query(
      `SELECT id FROM shifts 
       WHERE user_id = $1 AND end_time IS NULL 
       ORDER BY start_time DESC LIMIT 1`,
      [userId]
    );

    if (activeShift.rows.length > 0) {
      const shiftId = activeShift.rows[0].id;
      await client.query(
        `INSERT INTO breaks (shift_id, user_id, start_time) 
         VALUES ($1, $2, $3)`,
        [shiftId, userId, timestamp]
      );
    }
  } else {
    const activeBreak = await client.query(
      `SELECT id, shift_id FROM breaks 
       WHERE user_id = $1 AND end_time IS NULL 
       ORDER BY start_time DESC LIMIT 1`,
      [userId]
    );

    if (activeBreak.rows.length > 0) {
      const { id: breakId, shift_id: shiftId } = activeBreak.rows[0];
      await client.query(
        `UPDATE breaks SET end_time = $1 WHERE id = $2`,
        [timestamp, breakId]
      );

      await client.query(
        `INSERT INTO time_entries (user_id, shift_id, action, timestamp) 
         VALUES ($1, $2, $3, $4)`,
        [userId, shiftId, action, timestamp]
      );
    }
  }
}

export default router;