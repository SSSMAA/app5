const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Smart Dashboard Analysis
router.post('/dashboard-analysis', authenticateToken, async (req, res) => {
  try {
    // Get KPIs from database
    const revenueResult = await pool.query('SELECT SUM(amount) as total FROM payments');
    const expensesResult = await pool.query('SELECT SUM(amount) as total FROM expenses');
    const studentsResult = await pool.query('SELECT COUNT(*) as total FROM students WHERE status = $1', ['نشط']);
    const leadsResult = await pool.query('SELECT COUNT(*) as total FROM leads');

    const totalRevenue = parseFloat(revenueResult.rows[0].total || 0);
    const totalExpenses = parseFloat(expensesResult.rows[0].total || 0);
    const activeStudents = parseInt(studentsResult.rows[0].total || 0);
    const totalLeads = parseInt(leadsResult.rows[0].total || 0);
    const netProfit = totalRevenue - totalExpenses;

    const prompt = `
      You are an expert business analyst for an educational center called ISCHOOLGO.
      Analyze these KPIs and provide a concise summary and smart, actionable recommendations in Arabic.
      - Total Revenue: ${totalRevenue} DH
      - Total Expenses: ${totalExpenses} DH
      - Net Profit: ${netProfit} DH
      - Active Students: ${activeStudents}
      - Total Leads: ${totalLeads}
      Structure your response with "### تحليل الأداء" and "### توصيات ذكية للتحسين" headings.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    res.json({ analysis });
  } catch (error) {
    console.error('AI Dashboard Analysis error:', error);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
});

// Smart Assistant
router.post('/assistant', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get context data from database
    const studentsResult = await pool.query('SELECT COUNT(*) as total FROM students');
    const leadsResult = await pool.query('SELECT COUNT(*) as total FROM leads');
    const revenueResult = await pool.query('SELECT SUM(amount) as total FROM payments');

    const totalStudents = parseInt(studentsResult.rows[0].total || 0);
    const totalLeads = parseInt(leadsResult.rows[0].total || 0);
    const totalRevenue = parseFloat(revenueResult.rows[0].total || 0);

    const prompt = `You are an AI assistant for ISCHOOLGO. Based on this data, answer the user's question in Arabic.
    Data:
    - Total Students: ${totalStudents}
    - Total Leads: ${totalLeads}
    - Total Revenue: ${totalRevenue} DH
    User's question: "${query}"
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    res.json({ answer });
  } catch (error) {
    console.error('AI Assistant error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

// Content Generation
router.post('/generate-content', authenticateToken, async (req, res) => {
  try {
    const { topic, contentType } = req.body;

    if (!topic || !contentType) {
      return res.status(400).json({ error: 'Topic and content type are required' });
    }

    let prompt = '';
    if (contentType === 'marketing') {
      prompt = `You are a marketing expert for ISCHOOLGO. Write an engaging Facebook post in Arabic about our new course on "${topic}". Use emojis and a clear call to action.`;
    } else if (contentType === 'quiz') {
      prompt = `You are a teacher. Generate a 3-question multiple-choice quiz in Arabic for intermediate level students on the topic of "${topic}". Provide the correct answer for each question.`;
    } else {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    res.json({ content });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Student Risk Analysis
router.post('/student-risk-analysis', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Get student data
    const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentResult.rows[0];

    // Get attendance data
    const attendanceResult = await pool.query(
      'SELECT status FROM attendance WHERE student_id = $1',
      [studentId]
    );

    const totalSessions = attendanceResult.rows.length;
    const presentSessions = attendanceResult.rows.filter(row => row.status === 'حاضر').length;
    const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 100;

    // Determine risk factors
    let riskFactors = [];
    if (student.payment_status === 'متأخر') riskFactors.push('دفع متأخر');
    if (student.status === 'معلق') riskFactors.push('حالة معلقة');
    if (attendanceRate < 60) riskFactors.push(`حضور منخفض (${attendanceRate.toFixed(0)}%)`);

    if (riskFactors.length === 0) {
      return res.json({ interventionPlan: 'الطالب في وضع جيد ولا يحتاج لخطة تدخل حالياً.' });
    }

    const prompt = `You are an educational advisor. A student named ${student.student_name} is at risk due to: ${riskFactors.join(', ')}. Suggest a concise, personalized intervention plan with 3 actionable steps in Arabic.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const interventionPlan = response.text();

    res.json({ interventionPlan, riskFactors });
  } catch (error) {
    console.error('Student risk analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze student risk' });
  }
});

module.exports = router;