const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateStudent, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        t.full_name as teacher_name,
        g.name as group_name
      FROM students s
      LEFT JOIN teachers t ON s.teacher_id = t.id
      LEFT JOIN groups g ON s.group_id = g.id
      ORDER BY s.created_at DESC
    `);

    const students = result.rows.map(row => ({
      id: row.id,
      studentName: row.student_name,
      parentName: row.parent_name,
      phoneNumber: row.phone_number,
      email: row.email,
      age: row.age,
      level: row.level,
      groupId: row.group_id,
      teacherId: row.teacher_id,
      registrationDate: row.registration_date?.toISOString().split('T')[0].split('-').reverse().join('/'),
      subscriptionType: row.subscription_type,
      monthlyFee: parseFloat(row.monthly_fee),
      paymentStatus: row.payment_status,
      lastPaymentDate: row.last_payment_date?.toISOString().split('T')[0].split('-').reverse().join('/'),
      status: row.status,
      teacherName: row.teacher_name,
      groupName: row.group_name
    }));

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create new student
router.post('/', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR', 'AGENT'),
  validateStudent,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        studentName,
        parentName,
        phoneNumber,
        email,
        age,
        level,
        groupId,
        teacherId,
        subscriptionType,
        monthlyFee
      } = req.body;

      const result = await pool.query(`
        INSERT INTO students (
          student_name, parent_name, phone_number, email, age, level,
          group_id, teacher_id, subscription_type, monthly_fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [studentName, parentName, phoneNumber, email, age, level, groupId, teacherId, subscriptionType, monthlyFee]);

      // Update group student count
      if (groupId) {
        await pool.query(
          'UPDATE groups SET students_count = students_count + 1 WHERE id = $1',
          [groupId]
        );
      }

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating student:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ error: 'Student with this phone number already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create student' });
      }
    }
  }
);

// Update student
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR', 'AGENT'),
  validateStudent,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        studentName,
        parentName,
        phoneNumber,
        email,
        age,
        level,
        groupId,
        teacherId,
        subscriptionType,
        monthlyFee,
        paymentStatus,
        status
      } = req.body;

      const result = await pool.query(`
        UPDATE students SET
          student_name = $1,
          parent_name = $2,
          phone_number = $3,
          email = $4,
          age = $5,
          level = $6,
          group_id = $7,
          teacher_id = $8,
          subscription_type = $9,
          monthly_fee = $10,
          payment_status = $11,
          status = $12,
          updated_at = NOW()
        WHERE id = $13
        RETURNING *
      `, [studentName, parentName, phoneNumber, email, age, level, groupId, teacherId, subscriptionType, monthlyFee, paymentStatus, status, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ error: 'Failed to update student' });
    }
  }
);

// Delete student
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING group_id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Update group student count
      const groupId = result.rows[0].group_id;
      if (groupId) {
        await pool.query(
          'UPDATE groups SET students_count = students_count - 1 WHERE id = $1',
          [groupId]
        );
      }

      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ error: 'Failed to delete student' });
    }
  }
);

module.exports = router;