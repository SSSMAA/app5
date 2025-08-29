const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUser = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('role').isIn(['ADMIN', 'DIRECTOR', 'MARKETER', 'HEAD_TRAINER', 'AGENT', 'TEACHER']).withMessage('Invalid role'),
  body('status').isIn(['Active', 'Inactive']).withMessage('Invalid status'),
];

// Student validation rules
const validateStudent = [
  body('studentName').trim().isLength({ min: 2, max: 100 }).withMessage('Student name must be 2-100 characters'),
  body('parentName').trim().isLength({ min: 2, max: 100 }).withMessage('Parent name must be 2-100 characters'),
  body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number'),
  body('age').isInt({ min: 5, max: 25 }).withMessage('Age must be between 5 and 25'),
  body('level').isIn(['مبتدئ', 'متوسط', 'متقدم']).withMessage('Invalid level'),
];

// Payment validation rules
const validatePayment = [
  body('studentId').isUUID().withMessage('Invalid student ID'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('method').isIn(['Credit Card', 'Bank Transfer', 'Cash']).withMessage('Invalid payment method'),
];

// Teacher validation rules
const validateTeacher = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number'),
  body('email').isEmail().withMessage('Invalid email'),
  body('specialization').isIn(['لغة عربية', 'رياضيات', 'فيزياء', 'كيمياء']).withMessage('Invalid specialization'),
  body('experienceYears').isInt({ min: 0, max: 50 }).withMessage('Experience years must be 0-50'),
  body('salary').isFloat({ min: 0 }).withMessage('Salary must be positive'),
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateStudent,
  validatePayment,
  validateTeacher
};