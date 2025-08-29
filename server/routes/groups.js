const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.*,
        t.full_name as teacher_name
      FROM groups g
      LEFT JOIN teachers t ON g.teacher_id = t.id
      ORDER BY g.created_at DESC
    `);

    const groups = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      level: row.level,
      teacherId: row.teacher_id,
      teacherName: row.teacher_name || 'غير محدد',
      studentsCount: row.students_count,
      maxCapacity: row.max_capacity,
      weekdays: row.weekdays,
      startTime: row.start_time,
      endTime: row.end_time,
      classLink: row.class_link,
      status: row.status
    }));

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Create new group
router.post('/', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR', 'HEAD_TRAINER', 'TEACHER'),
  async (req, res) => {
    try {
      const {
        name,
        level,
        teacherId,
        maxCapacity,
        weekdays,
        startTime,
        endTime,
        classLink,
        status = 'نشط'
      } = req.body;

      // Get teacher name
      let teacherName = 'غير محدد';
      if (teacherId) {
        const teacherResult = await pool.query('SELECT full_name FROM teachers WHERE id = $1', [teacherId]);
        if (teacherResult.rows.length > 0) {
          teacherName = teacherResult.rows[0].full_name;
        }
      }

      const result = await pool.query(`
        INSERT INTO groups (
          name, level, teacher_id, max_capacity, weekdays, start_time, end_time, class_link, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [name, level, teacherId, maxCapacity, weekdays, startTime, endTime, classLink, status]);

      const group = {
        ...result.rows[0],
        teacherName
      };

      res.status(201).json(group);
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ error: 'Failed to create group' });
    }
  }
);

// Update group
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR', 'HEAD_TRAINER', 'TEACHER'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        level,
        teacherId,
        maxCapacity,
        weekdays,
        startTime,
        endTime,
        classLink,
        status
      } = req.body;

      const result = await pool.query(`
        UPDATE groups SET
          name = $1,
          level = $2,
          teacher_id = $3,
          max_capacity = $4,
          weekdays = $5,
          start_time = $6,
          end_time = $7,
          class_link = $8,
          status = $9,
          updated_at = NOW()
        WHERE id = $10
        RETURNING *
      `, [name, level, teacherId, maxCapacity, weekdays, startTime, endTime, classLink, status, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating group:', error);
      res.status(500).json({ error: 'Failed to update group' });
    }
  }
);

// Delete group
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR', 'HEAD_TRAINER'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query('DELETE FROM groups WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }

      res.json({ message: 'Group deleted successfully' });
    } catch (error) {
      console.error('Error deleting group:', error);
      res.status(500).json({ error: 'Failed to delete group' });
    }
  }
);

module.exports = router;