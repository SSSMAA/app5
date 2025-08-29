const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get attendance records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { month, year, groupId, teacherId } = req.query;
    
    let query = `
      SELECT 
        a.*,
        g.name as group_name,
        t.full_name as teacher_name
      FROM attendance a
      LEFT JOIN groups g ON a.group_id = g.id
      LEFT JOIN teachers t ON g.teacher_id = t.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (month && year) {
      conditions.push(`EXTRACT(MONTH FROM a.date) = $${params.length + 1}`);
      params.push(parseInt(month));
      conditions.push(`EXTRACT(YEAR FROM a.date) = $${params.length + 1}`);
      params.push(parseInt(year));
    }
    
    if (groupId) {
      conditions.push(`a.group_id = $${params.length + 1}`);
      params.push(groupId);
    }
    
    if (teacherId) {
      conditions.push(`g.teacher_id = $${params.length + 1}`);
      params.push(teacherId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY a.date DESC, a.student_name';

    const result = await pool.query(query, params);

    const attendance = result.rows.map(row => ({
      id: row.id,
      date: row.date?.toISOString().split('T')[0].split('-').reverse().join('/'),
      studentId: row.student_id,
      studentName: row.student_name,
      groupId: row.group_id,
      status: row.status,
      attendanceRate: parseFloat(row.attendance_rate || 0),
      notes: row.notes,
      groupName: row.group_name,
      teacherName: row.teacher_name
    }));

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Bulk create/update attendance
router.post('/bulk', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR', 'HEAD_TRAINER', 'TEACHER', 'AGENT'),
  async (req, res) => {
    try {
      const { records } = req.body;

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ error: 'Records array is required' });
      }

      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        for (const record of records) {
          const { date, studentId, studentName, groupId, status, notes } = record;
          
          // Convert DD/MM/YYYY to YYYY-MM-DD for database
          const [day, month, year] = date.split('/');
          const dbDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

          await client.query(`
            INSERT INTO attendance (date, student_id, student_name, group_id, status, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (date, student_id) 
            DO UPDATE SET 
              status = EXCLUDED.status,
              notes = EXCLUDED.notes,
              updated_at = NOW()
          `, [dbDate, studentId, studentName, groupId, status, notes]);
        }

        await client.query('COMMIT');
        res.json({ message: 'Attendance records saved successfully' });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Error saving attendance:', error);
      res.status(500).json({ error: 'Failed to save attendance records' });
    }
  }
);

// Get attendance statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { groupId, teacherId, month, year } = req.query;
    
    let query = `
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN status = 'حاضر' THEN 1 END) as present_sessions,
        ROUND(
          (COUNT(CASE WHEN status = 'حاضر' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
          2
        ) as attendance_rate
      FROM attendance a
      LEFT JOIN groups g ON a.group_id = g.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (month && year) {
      conditions.push(`EXTRACT(MONTH FROM a.date) = $${params.length + 1}`);
      params.push(parseInt(month));
      conditions.push(`EXTRACT(YEAR FROM a.date) = $${params.length + 1}`);
      params.push(parseInt(year));
    }
    
    if (groupId) {
      conditions.push(`a.group_id = $${params.length + 1}`);
      params.push(groupId);
    }
    
    if (teacherId) {
      conditions.push(`g.teacher_id = $${params.length + 1}`);
      params.push(teacherId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, params);
    
    res.json({
      totalSessions: parseInt(result.rows[0].total_sessions || 0),
      presentSessions: parseInt(result.rows[0].present_sessions || 0),
      attendanceRate: parseFloat(result.rows[0].attendance_rate || 0)
    });

  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ error: 'Failed to fetch attendance statistics' });
  }
});

module.exports = router;