// time-clock-backend/src/routes/summaries.js
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = express.Router();
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'timeclock',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// GET - Daily summaries
router.get('/daily', async (req, res) => {
  try {
    const { userId = 1, startDate, endDate } = req.query;
    
    const query = `
      SELECT 
        DATE(s.start_time) as date,
        s.category,
        COUNT(DISTINCT s.id) as shift_count,
        SUM(s.total_hours) as total_hours,
        SUM(s.total_break_time) as total_break_time,
        MIN(s.start_time) as first_clock_in,
        MAX(s.end_time) as last_clock_out,
        STRING_AGG(DISTINCT s.notes, '; ') as shift_notes
      FROM shifts s
      WHERE s.user_id = $1
        AND s.start_time >= $2
        AND s.start_time <= $3
      GROUP BY DATE(s.start_time), s.category
      ORDER BY DATE(s.start_time) DESC
    `;

    const result = await pool.query(query, [userId, startDate, endDate]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching daily summaries:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Weekly summary
router.get('/weekly', async (req, res) => {
  try {
    const { userId = 1, year, week } = req.query;
    
    const query = `
      SELECT 
        DATE_TRUNC('week', s.start_time) as week_start,
        s.category,
        COUNT(DISTINCT s.id) as shift_count,
        SUM(s.total_hours) as total_hours,
        SUM(s.total_break_time) as total_break_time,
        COUNT(DISTINCT DATE(s.start_time)) as days_worked
      FROM shifts s
      WHERE s.user_id = $1
        AND EXTRACT(YEAR FROM s.start_time) = $2
        AND EXTRACT(WEEK FROM s.start_time) = $3
      GROUP BY DATE_TRUNC('week', s.start_time), s.category
      ORDER BY week_start DESC
    `;

    const result = await pool.query(query, [userId, year, week]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Monthly overview
router.get('/monthly', async (req, res) => {
  try {
    const { userId = 1, year, month } = req.query;
    
    const query = `
      SELECT 
        DATE_TRUNC('month', s.start_time) as month_start,
        s.category,
        COUNT(DISTINCT s.id) as shift_count,
        SUM(s.total_hours) as total_hours,
        SUM(s.total_break_time) as total_break_time,
        COUNT(DISTINCT DATE(s.start_time)) as days_worked,
        AVG(s.total_hours) as avg_hours_per_shift
      FROM shifts s
      WHERE s.user_id = $1
        AND EXTRACT(YEAR FROM s.start_time) = $2
        AND EXTRACT(MONTH FROM s.start_time) = $3
      GROUP BY DATE_TRUNC('month', s.start_time), s.category
      ORDER BY month_start DESC
    `;

    const result = await pool.query(query, [userId, year, month]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly overview:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;