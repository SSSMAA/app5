const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validatePayment, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get all payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { month, year, studentId } = req.query;
    
    let query = `
      SELECT 
        p.*,
        s.student_name
      FROM payments p
      LEFT JOIN students s ON p.student_id = s.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (month && year) {
      conditions.push(`EXTRACT(MONTH FROM p.payment_date) = $${params.length + 1}`);
      params.push(parseInt(month));
      conditions.push(`EXTRACT(YEAR FROM p.payment_date) = $${params.length + 1}`);
      params.push(parseInt(year));
    }
    
    if (studentId) {
      conditions.push(`p.student_id = $${params.length + 1}`);
      params.push(studentId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.payment_date DESC';

    const result = await pool.query(query, params);

    const payments = result.rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      studentName: row.student_name,
      paymentDate: row.payment_date?.toISOString().split('T')[0].split('-').reverse().join('/'),
      amount: parseFloat(row.amount),
      method: row.method,
      courseName: row.course_name,
      monthlyFee: parseFloat(row.monthly_fee || 0),
      discount: parseFloat(row.discount || 0),
      receiptFileName: row.receipt_file_name
    }));

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Create new payment
router.post('/', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR', 'AGENT'),
  validatePayment,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        studentId,
        amount,
        method,
        courseName,
        monthlyFee,
        discount = 0
      } = req.body;

      // Get student name
      const studentResult = await pool.query('SELECT student_name FROM students WHERE id = $1', [studentId]);
      if (studentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const studentName = studentResult.rows[0].student_name;

      const result = await pool.query(`
        INSERT INTO payments (
          student_id, student_name, amount, method, course_name, monthly_fee, discount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [studentId, studentName, amount, method, courseName, monthlyFee, discount]);

      // Update student payment status
      await pool.query(`
        UPDATE students SET 
          payment_status = 'مدفوع',
          last_payment_date = CURRENT_DATE,
          updated_at = NOW()
        WHERE id = $1
      `, [studentId]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ error: 'Failed to create payment' });
    }
  }
);

// Update payment
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR', 'AGENT'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, method, courseName, monthlyFee, discount } = req.body;

      const result = await pool.query(`
        UPDATE payments SET
          amount = $1,
          method = $2,
          course_name = $3,
          monthly_fee = $4,
          discount = $5,
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `, [amount, method, courseName, monthlyFee, discount, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({ error: 'Failed to update payment' });
    }
  }
);

// Delete payment
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'DIRECTOR'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
      console.error('Error deleting payment:', error);
      res.status(500).json({ error: 'Failed to delete payment' });
    }
  }
);

module.exports = router;