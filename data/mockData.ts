import type { Lead, Visitor, Student, Payment, Attendance, Teacher, GroupClass, Expense, Campaign, Report, InventoryItem, Applicant, User } from '../types';

export const mockCampaigns: Campaign[] = [
  { id: 'C01', name: 'حملة رمضان فيسبوك', startDate: '01/07/2024', endDate: '31/07/2024' },
  { id: 'C02', name: 'حملة الصيف جوجل', startDate: '15/07/2024', endDate: '15/08/2024' },
  { id: 'C03', name: 'حملة انستغرام للشباب', startDate: '10/07/2024', endDate: '10/08/2024' },
];

export const mockLeads: Lead[] = [
  { id: 'L001', name: 'أحمد محمود', phone: '+212612345678', email: 'ahmad@example.com', source: 'Facebook', campaignId: 'C01', receivedDate: '01/07/2024', status: 'تم التحويل', followUpDate: '03/07/2024', assignedAgentId: 'U02', notes: 'مهتم جداً بالرياضيات' },
  { id: 'L002', name: 'سارة علي', phone: '+212687654321', email: 'sara@example.com', source: 'Google', campaignId: 'C02', receivedDate: '02/07/2024', status: 'حجز حصة', followUpDate: '05/07/2024', assignedAgentId: 'U03', notes: 'تريد حصة تجريبية في الفيزياء' },
  { id: 'L003', name: 'ياسين كريم', phone: '+212611223344', email: 'yassin@example.com', source: 'Instagram', campaignId: 'C03', receivedDate: '03/07/2024', status: 'متصل به', followUpDate: '06/07/2024', assignedAgentId: 'U02', notes: '' },
  { id: 'L004', name: 'ليلى رشيد', phone: '+212699887766', email: 'laila@example.com', source: 'WhatsApp', campaignId: 'C01', receivedDate: '04/07/2024', status: 'جديد', followUpDate: '07/07/2024', assignedAgentId: 'U03', notes: 'استفسرت عن الأسعار' },
  { id: 'L005', name: 'عمر بلقاسم', phone: '+212655443322', email: 'omar@example.com', source: 'Facebook', campaignId: 'C02', receivedDate: '05/07/2024', status: 'ملغي', followUpDate: '08/07/2024', assignedAgentId: 'U02', notes: 'غير مهتم حالياً' },
];

export const mockVisitors: Visitor[] = [
  { id: 'V1', studentName: 'ليلى رشيد', parentName: 'رشيد العلمي', phoneNumber: '+212699887766', age: 14, desiredLevel: 'مبتدئ', source: 'WhatsApp', contactDate: '04/07/2024', assignedAgentId: 'U03', trialDate: '', trialTime: '', teacherId: '', trialStatus: 'لم يحضر', finalDecision: 'يفكر', notes: 'استفسرت عن الأسعار', pipelineStatus: 'جديد' },
  { id: 'V2', studentName: 'سارة علي', parentName: 'علي حسن', phoneNumber: '+212687654321', age: 15, desiredLevel: 'متقدم', source: 'Google', contactDate: '05/07/2024', assignedAgentId: 'U03', trialDate: '10/07/2024', trialTime: '16:00', teacherId: 'T002', trialStatus: 'مجدولة', finalDecision: 'يفكر', notes: 'الأب يريد معرفة المزيد عن المنهج', pipelineStatus: 'حصة مجدولة' },
  { id: 'V3', studentName: 'أمين خالد', parentName: 'خالد إدريس', phoneNumber: '+212610101010', age: 12, desiredLevel: 'مبتدئ', source: 'مراجعة', contactDate: '06/07/2024', assignedAgentId: 'U02', trialDate: '11/07/2024', trialTime: '18:00', teacherId: 'T001', trialStatus: 'حضر', finalDecision: 'يفكر', notes: 'لم يتم التسجيل بعد', pipelineStatus: 'متابعة' },
  { id: 'V4', studentName: 'كريم صلاح', parentName: 'صلاح الدين', phoneNumber: '+212644556677', age: 16, desiredLevel: 'متوسط', source: 'Facebook', contactDate: '07/07/2024', assignedAgentId: 'U02', trialDate: '', trialTime: '', teacherId: '', trialStatus: 'لم يحضر', finalDecision: 'يفكر', notes: 'تم التواصل، ينتظر تأكيد الموعد من الأب', pipelineStatus: 'تم التواصل'},
  { id: 'V5', studentName: 'زينب مراد', parentName: 'مراد فتحي', phoneNumber: '+212633221100', age: 13, desiredLevel: 'متوسط', source: 'Google', contactDate: '08/07/2024', assignedAgentId: 'U03', trialDate: '12/07/2024', trialTime: '15:00', teacherId: 'T001', trialStatus: 'حضر', finalDecision: 'يفكر', notes: 'كانت الحصة جيدة، سيتصلون للتأكيد', pipelineStatus: 'متابعة' },
  { id: 'V6', studentName: 'هشام طارق', parentName: 'طارق عزيز', phoneNumber: '+212698765432', age: 17, desiredLevel: 'متقدم', source: 'Instagram', contactDate: '09/07/2024', assignedAgentId: 'U03', trialDate: '11/07/2024', trialTime: '19:00', teacherId: 'T002', trialStatus: 'ألغيت', finalDecision: 'رفض', notes: 'وجدوا بديلاً آخر', pipelineStatus: 'ملغي' },
];

export const mockStudents: Student[] = [
  { id: 'S2', studentName: 'أحمد محمود', parentName: 'محمود السيد', phoneNumber: '+212612345678', email: 'ahmad@example.com', age: 16, level: 'متوسط', groupId: 'G001', teacherId: 'T001', registrationDate: '05/07/2024', subscriptionType: 'شهري', monthlyFee: 500, paymentStatus: 'مدفوع', lastPaymentDate: '05/07/2024', status: 'نشط' },
  { id: 'S3', studentName: 'أمين خالد', parentName: 'خالد إدريس', phoneNumber: '+212610101010', email: 'amin@example.com', age: 12, level: 'مبتدئ', groupId: 'G002', teacherId: 'T001', registrationDate: '07/07/2024', subscriptionType: 'ربعي', monthlyFee: 450, paymentStatus: 'مدفوع', lastPaymentDate: '07/07/2024', status: 'نشط' },
  { id: 'S4', studentName: 'هند فتحي', parentName: 'فتحي جمال', phoneNumber: '+212620202020', email: 'hind@example.com', age: 17, level: 'متقدم', groupId: 'G003', teacherId: 'T002', registrationDate: '15/05/2024', subscriptionType: 'شهري', monthlyFee: 600, paymentStatus: 'متأخر', lastPaymentDate: '15/06/2024', status: 'نشط' },
  { id: 'S5', studentName: 'كريم نبيل', parentName: 'نبيل شوقي', phoneNumber: '+212630303030', email: 'karim@example.com', age: 14, level: 'متوسط', groupId: 'G001', teacherId: 'T001', registrationDate: '01/04/2024', subscriptionType: 'نصف سنوي', monthlyFee: 400, paymentStatus: 'مدفوع', lastPaymentDate: '01/07/2024', status: 'معلق' },
  { id: 'S6', studentName: 'سارة كمال', parentName: 'كمال ياسين', phoneNumber: '+212640404040', email: 'sara.k@example.com', age: 13, level: 'مبتدئ', groupId: 'G002', teacherId: 'T001', registrationDate: '01/02/2024', subscriptionType: 'شهري', monthlyFee: 450, paymentStatus: 'مدفوع', lastPaymentDate: '01/06/2024', status: 'منقطع' },
];

export const mockPayments: Payment[] = [
  { id: 'P01', studentId: 'S2', studentName: 'أحمد محمود', paymentDate: '05/07/2024', amount: 500, method: 'Credit Card', courseName: 'رياضيات متوسط', monthlyFee: 500, discount: 0, receiptFileName: 'rec_ahmad_july.pdf' },
  { id: 'P02', studentId: 'S3', studentName: 'أمين خالد', paymentDate: '07/07/2024', amount: 1250, method: 'Bank Transfer', courseName: 'برمجة للناشئين', monthlyFee: 450, discount: 100 },
  { id: 'P03', studentId: 'S4', studentName: 'هند فتحي', paymentDate: '15/06/2024', amount: 600, method: 'Cash', courseName: 'فيزياء متقدم', monthlyFee: 600, discount: 0, receiptFileName: 'rec_hind_june.pdf' },
  { id: 'P04', studentId: 'S5', studentName: 'كريم نبيل', paymentDate: '01/07/2024', amount: 2200, method: 'Credit Card', courseName: 'رياضيات متوسط', monthlyFee: 400, discount: 200 },
  { id: 'P05', studentId: 'S2', studentName: 'أحمد محمود', paymentDate: '05/08/2024', amount: 500, method: 'Credit Card', courseName: 'رياضيات متوسط', monthlyFee: 500, discount: 0 },
];

export const mockAttendance: Attendance[] = [
    { id: 'A01', date: '08/07/2024', studentId: 'S2', studentName: 'أحمد محمود', groupId: 'G001', status: 'حاضر', attendanceRate: 100 },
    { id: 'A02', date: '08/07/2024', studentId: 'S5', studentName: 'كريم نبيل', groupId: 'G001', status: 'غائب', attendanceRate: 0 },
    { id: 'A03', date: '09/07/2024', studentId: 'S3', studentName: 'أمين خالد', groupId: 'G002', status: 'حاضر', attendanceRate: 100 },
    { id: 'A04', date: '09/07/2024', studentId: 'S4', studentName: 'هند فتحي', groupId: 'G003', status: 'حاضر', attendanceRate: 100 },
];

export const mockTeachers: Teacher[] = [
  { id: 'T001', fullName: 'علي بناني', phoneNumber: '+212611111111', email: 'ali.b@ischoolgo.com', specialization: 'رياضيات', qualifications: 'ماجستير في الرياضيات', experienceYears: 10, hireDate: '01/09/2022', salary: 15000, contractType: 'دوام كامل', status: 'نشط', overallRating: 5, performanceNotes: [{id: 'PN1', date: '01/06/2024', note: 'أداء ممتاز خلال الربع الأخير.'}] },
  { id: 'T002', fullName: 'فاطمة العلوي', phoneNumber: '+212622222222', email: 'fatima.a@ischoolgo.com', specialization: 'فيزياء', qualifications: 'دكتوراه في الفيزياء', experienceYears: 8, hireDate: '15/10/2022', salary: 12000, contractType: 'دوام جزئي', status: 'نشط', overallRating: 4, performanceNotes: [] },
  { id: 'T003', fullName: 'محمد العلمي', phoneNumber: '+212633333333', email: 'mohamed.e@ischoolgo.com', specialization: 'لغة عربية', qualifications: 'إجازة في الأدب العربي', experienceYears: 15, hireDate: '01/03/2023', salary: 14000, contractType: 'دوام كامل', status: 'معلق', overallRating: 4, performanceNotes: [] },
];

export const mockGroupClasses: GroupClass[] = [
  { id: 'G001', name: 'عمالقة الرياضيات', level: 'متوسط', teacherId: 'T001', teacherName: 'علي بناني', studentsCount: 12, maxCapacity: 15, weekdays: 'الإثنين,الأربعاء', startTime: '17:00', endTime: '18:30', classLink: 'https://meet.google.com/xyz-abc-def', status: 'نشط' },
  { id: 'G002', name: 'مبتدئو العربية', level: 'مبتدئ', teacherId: 'T003', teacherName: 'محمد العلمي', studentsCount: 8, maxCapacity: 10, weekdays: 'الثلاثاء,الخميس', startTime: '16:00', endTime: '17:30', classLink: 'https://meet.google.com/ghi-jkl-mno', status: 'نشط' },
  { id: 'G003', name: 'محترفو الفيزياء', level: 'متقدم', teacherId: 'T002', teacherName: 'فاطمة العلوي', studentsCount: 10, maxCapacity: 10, weekdays: 'الأحد,الثلاثاء', startTime: '19:00', endTime: '20:30', classLink: 'https://meet.google.com/pqr-stu-vwx', status: 'معلق' },
];

export const mockExpenses: Expense[] = [
    { id: 'E01', date: '02/07/2024', category: 'Marketing', description: 'Facebook Campaign C01', amount: 2500, campaignId: 'C01' },
    { id: 'E02', date: '03/07/2024', category: 'Software', description: 'Zoom Subscription', amount: 500 },
    { id: 'E03', date: '05/07/2024', category: 'Utilities', description: 'Internet Bill', amount: 400 },
    { id: 'E04', date: '05/08/2024', category: 'Marketing', description: 'Google Ads', amount: 3000, campaignId: 'C02' },
];

export const mockReports: Report[] = [
  { id: 'R01', title: 'تقرير أداء حملات شهر يوليو', description: 'ملخص أداء جميع الحملات الإعلانية للشهر الماضي.', fileName: 'marketing_report_july.pdf', uploadDate: '01/08/2024', uploadedBy: 'MARKETER', uploadedByName: 'مسؤول التسويق' },
  { id: 'R02', title: 'تقرير تقييم الأساتذة - الربع الثالث', description: 'تقييمات الأداء للأساتذة.', fileName: 'teacher_eval_q3.docx', uploadDate: '02/08/2024', uploadedBy: 'HEAD_TRAINER', uploadedByName: 'مسؤول التدريب' },
  { id: 'R03', title: 'ملخص الحصص التجريبية', description: 'تقرير عن عدد الحصص ونسبة الحضور والتحويل.', fileName: 'trial_sessions_summary.xlsx', uploadDate: '03/08/2024', uploadedBy: 'AGENT', uploadedByName: 'وكيل خدمة العملاء' },
];

export const mockInventory: InventoryItem[] = [
    { id: 'INV01', name: 'كمبيوتر محمول Dell', category: 'أجهزة', quantity: 15, purchaseDate: '15/01/2024', unitPrice: 8000 },
    { id: 'INV02', name: 'طقم أقلام سبورة', category: 'لوازم مكتبية', quantity: 50, purchaseDate: '01/06/2024', unitPrice: 30 },
    { id: 'INV03', name: 'مجموعة روبوت تعليمي', category: 'مواد تعليمية', quantity: 20, purchaseDate: '20/03/2024', unitPrice: 1500 },
];

export const mockApplicants: Applicant[] = [
    { id: 'APP01', name: 'يوسف حمدي', position: 'أستاذ رياضيات', applicationDate: '10/07/2024', status: 'مقابلة', notes: 'خبرة 5 سنوات، يبدو واعداً.' },
    { id: 'APP02', name: 'لمياء فكري', position: 'أستاذ فيزياء', applicationDate: '12/07/2024', status: 'قيد المراجعة', notes: 'حديثة التخرج.' },
];

export const mockUsers: User[] = [
    { id: 'U01', fullName: 'علي بناني (أستاذ)', username: 'ali.teacher', role: 'TEACHER', status: 'Active', privileges: ['teacher:manage_attendance', 'teacher:manage_groups'] },
    { id: 'U02', fullName: 'فاطمة الزهراء (وكيل)', username: 'fatima.agent', role: 'AGENT', status: 'Active', privileges: ['agent:manage_visitors', 'agent:manage_students'] },
    { id: 'U03', fullName: 'يوسف أمين (وكيل)', username: 'youssef.agent', role: 'AGENT', status: 'Inactive', privileges: ['agent:manage_visitors'] },
    { id: 'U04', fullName: 'أحمد العلمي (مدرب)', username: 'ahmed.trainer', role: 'HEAD_TRAINER', status: 'Active', privileges: ['head_trainer:manage_teachers', 'head_trainer:view_all_groups'] },
    { id: 'U05', fullName: 'سارة كريم (مسوقة)', username: 'sara.marketer', role: 'MARKETER', status: 'Active', privileges: ['marketer:manage_leads', 'marketer:manage_campaigns'] },
    { id: 'U06', fullName: 'خالد إدريس (مدير تنفيذي)', username: 'khalid.director', role: 'DIRECTOR', status: 'Active', privileges: ['director:manage_hr', 'director:manage_finances'] },
    { id: 'U07', fullName: 'محمد السيد (مدير عام)', username: 'mohamed.admin', role: 'ADMIN', status: 'Active', privileges: ['admin:view_all_data', 'admin:manage_users'] },
];