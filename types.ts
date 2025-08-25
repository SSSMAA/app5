export type Role = 'ADMIN' | 'DIRECTOR' | 'MARKETER' | 'HEAD_TRAINER' | 'AGENT' | 'TEACHER' | 'SETTINGS' | 'REPORTS' | 'AI_INSIGHTS';

export interface Notification {
  id: string;
  message: string;
  type: 'payment' | 'capacity' | 'payment_due';
  date: string; // ISO String
  read: boolean;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  role: 'TEACHER' | 'AGENT' | 'HEAD_TRAINER' | 'MARKETER' | 'DIRECTOR' | 'ADMIN';
  status: 'Active' | 'Inactive';
  privileges: string[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: 'Facebook' | 'Google' | 'Instagram' | 'WhatsApp';
  campaignId: string;
  receivedDate: string;
  status: 'جديد' | 'متصل به' | 'حجز حصة' | 'تم التحويل' | 'ملغي';
  followUpDate: string;
  assignedAgentId: string;
  notes: string;
}

export type VisitorPipelineStatus = 'جديد' | 'تم التواصل' | 'حصة مجدولة' | 'متابعة' | 'مسجل' | 'ملغي';

export interface Visitor {
  id: string;
  studentName: string;
  parentName: string;
  phoneNumber: string;
  age: number;
  desiredLevel: 'مبتدئ' | 'متوسط' | 'متقدم';
  source: 'Facebook' | 'Google' | 'مراجعة' | 'WhatsApp' | 'Instagram';
  contactDate: string;
  assignedAgentId: string;
  trialDate: string;
  trialTime: string;
  teacherId: string;
  groupId?: string;
  trialStatus: 'مجدولة' | 'حضر' | 'لم يحضر' | 'ألغيت';
  finalDecision: 'سجل' | 'رفض' | 'يفكر';
  notes: string;
  pipelineStatus: VisitorPipelineStatus;
}

export interface Student {
  id: string;
  studentName: string;
  parentName: string;
  phoneNumber: string;
  email?: string;
  age: number;
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
  groupId: string;
  teacherId: string;
  registrationDate: string;
  subscriptionType: 'شهري' | 'ربعي' | 'نصف سنوي';
  monthlyFee: number;
  paymentStatus: 'مدفوع' | 'متأخر' | 'معلق';
  lastPaymentDate: string;
  status: 'نشط' | 'معلق' | 'منقطع';
}

export interface Payment {
  id: string;
  studentId: string;
  paymentDate: string;
  amount: number;
  method: 'Credit Card' | 'Bank Transfer' | 'Cash';
  studentName: string;
  courseName: string;
  monthlyFee: number;
  discount: number;
  receiptFileName?: string;
}

export interface Attendance {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  groupId: string;
  status: 'حاضر' | 'غائب';
  attendanceRate: number;
  notes?: string;
}

export interface PerformanceNote {
  id: string;
  date: string;
  note: string;
}

export interface Teacher {
  id: string;
  fullName:string;
  phoneNumber: string;
  email: string;
  specialization: 'لغة عربية' | 'رياضيات' | 'فيزياء' | 'كيمياء';
  qualifications: string;
  experienceYears: number;
  hireDate: string;
  salary: number;
  contractType: 'دوام كامل' | 'دوام جزئي';
  status: 'نشط' | 'معلق' | 'مفصول';
  overallRating: number;
  performanceNotes?: PerformanceNote[];
}

export interface GroupClass {
  id: string;
  name: string;
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
  teacherId: string;
  teacherName: string;
  studentsCount: number;
  maxCapacity: number;
  weekdays: string;
  startTime: string;
  endTime: string;
  classLink: string;
  status: 'نشط' | 'معلق' | 'منتهي';
}

export interface Expense {
  id: string;
  date: string;
  category: 'Marketing' | 'Utilities' | 'Software' | 'Other' | 'Inventory';
  description: string;
  amount: number;
  campaignId?: string;
}

export interface Campaign {
  id: string;
  name: string;
  startDate: string; // DD/MM/YYYY
  endDate: string; // DD/MM/YYYY
}

export interface InventoryItem {
    id: string;
    name: string;
    category: 'أجهزة' | 'لوازم مكتبية' | 'مواد تعليمية';
    quantity: number;
    purchaseDate: string;
    unitPrice: number;
}

export interface Applicant {
    id: string;
    name: string;
    position: string;
    applicationDate: string;
    status: 'قيد المراجعة' | 'مقابلة' | 'مقبول' | 'مرفوض';
    notes: string;
}

export interface Salary extends Teacher {
    paymentDate: string;
    netSalary: number;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  fileName: string;
  uploadDate: string; // DD/MM/YYYY
  uploadedBy: Role;
  uploadedByName: string;
}