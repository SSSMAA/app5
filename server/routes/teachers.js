const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateTeacher, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get all teachers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', pn.id,
              'date', pn.date,
              'note', pn.note
            )
          ) FILTER (WHERE pn.id IS NOT NULL), 
          '[]'
        ) as performance_notes
      FROM teachers t
      LEFT JOIN performance_notes pn ON t.id = pn.teacher_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    const teachers = result.rows.map(row => ({
      id: row.id,
      fullName: row.full_name,
      phoneNumber: row.phone_number,
      email: row.email,
      specialization: row.specialization,
      qualifications: row.qualifications,
      experienceYears: row.experience_years,
      hireDate: row.hire_date?.toISOString().split('T')[0].split('-').reverse().join('/'),
      salary: parseFloat(row.salary),
      contractType: row.contract_type,
      status: row.status,
      overallRating: row.overall_rating,
      performanceNotes: row.performance_notes
    }));

    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Create new teacher
router.post('/', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR', 'HEAD_TRAINER'),
  validateTeacher,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        fullName,
        phoneNumber,
        email,
        specialization,
        qualifications,
        experienceYears,
        hireDate,
        salary,
        contractType,
        status,
        overallRating
      } = req.body;

      const result = await pool.query(`
        INSERT INTO teachers (
          full_name, phone_number, email, specialization, qualifications,
          experience_years, hire_date, salary, contract_type, status, overall_rating
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [fullName, phoneNumber, email, specialization, qualifications, experienceYears, hireDate, salary, contractType, status, overallRating]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating teacher:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'Teacher with this email already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create teacher' });
      }
    }
  }
);

// Update teacher
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR', 'HEAD_TRAINER'),
  validateTeacher,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        fullName,
        phoneNumber,
        email,
        specialization,
        qualifications,
        experienceYears,
        salary,
        contractType,
        status,
        overallRating
      } = req.body;

      const result = await pool.query(`
        UPDATE teachers SET
          full_name = $1,
          phone_number = $2,
          email = $3,
          specialization = $4,
          qualifications = $5,
          experience_years = $6,
          salary = $7,
          contract_type = $8,
          status = $9,
          overall_rating = $10,
          updated_at = NOW()
        WHERE id = $11
        RETURNING *
      `, [fullName, phoneNumber, email, specialization, qualifications, experienceYears, salary, contractType, status, overallRating, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating teacher:', error);
      res.status(500).json({ error: 'Failed to update teacher' });
    }
  }
);

// Add performance note
router.post('/:id/performance-notes', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR', 'HEAD_TRAINER'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;

      if (!note || note.trim().length === 0) {
        return res.status(400).json({ error: 'Note is required' });
      }

      const result = await pool.query(`
        INSERT INTO performance_notes (teacher_id, note, created_by)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [id, note.trim(), req.user.id]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding performance note:', error);
      res.status(500).json({ error: 'Failed to add performance note' });
    }
  }
);

// Delete teacher
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query('DELETE FROM teachers WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      res.status(500).json({ error: 'Failed to delete teacher' });
    }
  }
);

module.exports = router;