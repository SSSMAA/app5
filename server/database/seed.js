const pool = require('../config/database');
const { hashPassword } = require('../config/auth');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order of dependencies)
    await pool.query('DELETE FROM performance_notes');
    await pool.query('DELETE FROM notifications');
    await pool.query('DELETE FROM reports');
    await pool.query('DELETE FROM attendance');
    await pool.query('DELETE FROM payments');
    await pool.query('DELETE FROM leads');
    await pool.query('DELETE FROM students');
    await pool.query('DELETE FROM visitors');
    await pool.query('DELETE FROM groups');
    await pool.query('DELETE FROM teachers');
    await pool.query('DELETE FROM applicants');
    await pool.query('DELETE FROM inventory');
    await pool.query('DELETE FROM expenses');
    await pool.query('DELETE FROM marketing_campaigns');
    await pool.query('DELETE FROM users');

    // Seed users
    const users = [
      { id: 'U01', username: 'ali.teacher', password: 'password123', fullName: 'علي بناني (أستاذ)', role: 'TEACHER' },
      { id: 'U02', username: 'fatima.agent', password: 'password123', fullName: 'فاطمة الزهراء (وكيل)', role: 'AGENT' },
      { id: 'U03', username: 'youssef.agent', password: 'password123', fullName: 'يوسف أمين (وكيل)', role: 'AGENT' },
      { id: 'U04', username: 'ahmed.trainer', password: 'password123', fullName: 'أحمد العلمي (مدرب)', role: 'HEAD_TRAINER' },
      { id: 'U05', username: 'sara.marketer', password: 'password123', fullName: 'سارة كريم (مسوقة)', role: 'MARKETER' },
      { id: 'U06', username: 'khalid.director', password: 'password123', fullName: 'خالد إدريس (مدير تنفيذي)', role: 'DIRECTOR' },
      { id: 'U07', username: 'mohamed.admin', password: 'password123', fullName: 'محمد السيد (مدير عام)', role: 'ADMIN' },
    ];

    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);
      await pool.query(
        'INSERT INTO users (id, username, password_hash, full_name, role, status, privileges) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user.id, user.username, hashedPassword, user.fullName, user.role, 'Active', JSON.stringify([])]
      );
    }

    // Seed marketing campaigns
    const campaigns = [
      { id: 'C01', name: 'حملة رمضان فيسبوك', startDate: '2024-07-01', endDate: '2024-07-31', budget: 5000 },
      { id: 'C02', name: 'حملة الصيف جوجل', startDate: '2024-07-15', endDate: '2024-08-15', budget: 7500 },
      { id: 'C03', name: 'حملة انستغرام للشباب', startDate: '2024-07-10', endDate: '2024-08-10', budget: 3000 },
    ];

    for (const campaign of campaigns) {
      await pool.query(
        'INSERT INTO marketing_campaigns (id, name, start_date, end_date, budget) VALUES ($1, $2, $3, $4, $5)',
        [campaign.id, campaign.name, campaign.startDate, campaign.endDate, campaign.budget]
      );
    }

    // Seed teachers
    const teachers = [
      { id: 'T001', userId: 'U01', fullName: 'علي بناني', phone: '+212611111111', email: 'ali.b@ischoolgo.com', specialization: 'رياضيات', qualifications: 'ماجستير في الرياضيات', experienceYears: 10, hireDate: '2022-09-01', salary: 15000, contractType: 'دوام كامل', status: 'نشط', overallRating: 5 },
      { id: 'T002', userId: null, fullName: 'فاطمة العلوي', phone: '+212622222222', email: 'fatima.a@ischoolgo.com', specialization: 'فيزياء', qualifications: 'دكتوراه في الفيزياء', experienceYears: 8, hireDate: '2022-10-15', salary: 12000, contractType: 'دوام جزئي', status: 'نشط', overallRating: 4 },
      { id: 'T003', userId: null, fullName: 'محمد العلمي', phone: '+212633333333', email: 'mohamed.e@ischoolgo.com', specialization: 'لغة عربية', qualifications: 'إجازة في الأدب العربي', experienceYears: 15, hireDate: '2023-03-01', salary: 14000, contractType: 'دوام كامل', status: 'معلق', overallRating: 4 },
    ];

    for (const teacher of teachers) {
      await pool.query(
        'INSERT INTO teachers (id, user_id, full_name, phone_number, email, specialization, qualifications, experience_years, hire_date, salary, contract_type, status, overall_rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [teacher.id, teacher.userId, teacher.fullName, teacher.phone, teacher.email, teacher.specialization, teacher.qualifications, teacher.experienceYears, teacher.hireDate, teacher.salary, teacher.contractType, teacher.status, teacher.overallRating]
      );
    }

    // Seed groups
    const groups = [
      { id: 'G001', name: 'عمالقة الرياضيات', level: 'متوسط', teacherId: 'T001', studentsCount: 12, maxCapacity: 15, weekdays: 'الإثنين,الأربعاء', startTime: '17:00', endTime: '18:30', classLink: 'https://meet.google.com/xyz-abc-def', status: 'نشط' },
      { id: 'G002', name: 'مبتدئو العربية', level: 'مبتدئ', teacherId: 'T003', studentsCount: 8, maxCapacity: 10, weekdays: 'الثلاثاء,الخميس', startTime: '16:00', endTime: '17:30', classLink: 'https://meet.google.com/ghi-jkl-mno', status: 'نشط' },
      { id: 'G003', name: 'محترفو الفيزياء', level: 'متقدم', teacherId: 'T002', studentsCount: 10, maxCapacity: 10, weekdays: 'الأحد,الثلاثاء', startTime: '19:00', endTime: '20:30', classLink: 'https://meet.google.com/pqr-stu-vwx', status: 'معلق' },
    ];

    for (const group of groups) {
      await pool.query(
        'INSERT INTO groups (id, name, level, teacher_id, students_count, max_capacity, weekdays, start_time, end_time, class_link, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [group.id, group.name, group.level, group.teacherId, group.studentsCount, group.maxCapacity, group.weekdays, group.startTime, group.endTime, group.classLink, group.status]
      );
    }

    // Seed students
    const students = [
      { id: 'S2', studentName: 'أحمد محمود', parentName: 'محمود السيد', phoneNumber: '+212612345678', email: 'ahmad@example.com', age: 16, level: 'متوسط', groupId: 'G001', teacherId: 'T001', registrationDate: '2024-07-05', subscriptionType: 'شهري', monthlyFee: 500, paymentStatus: 'مدفوع', lastPaymentDate: '2024-07-05', status: 'نشط' },
      { id: 'S3', studentName: 'أمين خالد', parentName: 'خالد إدريس', phoneNumber: '+212610101010', email: 'amin@example.com', age: 12, level: 'مبتدئ', groupId: 'G002', teacherId: 'T001', registrationDate: '2024-07-07', subscriptionType: 'ربعي', monthlyFee: 450, paymentStatus: 'مدفوع', lastPaymentDate: '2024-07-07', status: 'نشط' },
      { id: 'S4', studentName: 'هند فتحي', parentName: 'فتحي جمال', phoneNumber: '+212620202020', email: 'hind@example.com', age: 17, level: 'متقدم', groupId: 'G003', teacherId: 'T002', registrationDate: '2024-05-15', subscriptionType: 'شهري', monthlyFee: 600, paymentStatus: 'متأخر', lastPaymentDate: '2024-06-15', status: 'نشط' },
      { id: 'S5', studentName: 'كريم نبيل', parentName: 'نبيل شوقي', phoneNumber: '+212630303030', email: 'karim@example.com', age: 14, level: 'متوسط', groupId: 'G001', teacherId: 'T001', registrationDate: '2024-04-01', subscriptionType: 'نصف سنوي', monthlyFee: 400, paymentStatus: 'مدفوع', lastPaymentDate: '2024-07-01', status: 'معلق' },
      { id: 'S6', studentName: 'سارة كمال', parentName: 'كمال ياسين', phoneNumber: '+212640404040', email: 'sara.k@example.com', age: 13, level: 'مبتدئ', groupId: 'G002', teacherId: 'T001', registrationDate: '2024-02-01', subscriptionType: 'شهري', monthlyFee: 450, paymentStatus: 'مدفوع', lastPaymentDate: '2024-06-01', status: 'منقطع' },
    ];

    for (const student of students) {
      await pool.query(
        'INSERT INTO students (id, student_name, parent_name, phone_number, email, age, level, group_id, teacher_id, registration_date, subscription_type, monthly_fee, payment_status, last_payment_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
        [student.id, student.studentName, student.parentName, student.phoneNumber, student.email, student.age, student.level, student.groupId, student.teacherId, student.registrationDate, student.subscriptionType, student.monthlyFee, student.paymentStatus, student.lastPaymentDate, student.status]
      );
    }

    // Seed more data...
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = { seedDatabase };