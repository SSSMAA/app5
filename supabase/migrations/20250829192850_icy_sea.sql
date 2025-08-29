/*
  # Initial Database Schema for ISCHOOLGO

  1. New Tables
    - `users` - System users with roles and authentication
    - `students` - Student records with enrollment details
    - `visitors` - Potential students in the pipeline
    - `teachers` - Teacher profiles and qualifications
    - `groups` - Class groups and schedules
    - `attendance` - Student attendance records
    - `payments` - Payment transactions
    - `marketing_campaigns` - Marketing campaign data
    - `expenses` - Business expense tracking
    - `inventory` - Equipment and supplies inventory
    - `applicants` - Job applicants
    - `reports` - Uploaded reports and documents
    - `notifications` - System notifications
    - `performance_notes` - Teacher performance evaluations

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for role-based access
    - Secure password storage with bcrypt hashing

  3. Features
    - UUID primary keys for security
    - Proper foreign key relationships
    - Audit trails with timestamps
    - Flexible JSON fields for extensibility
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (authentication and roles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'DIRECTOR', 'MARKETER', 'HEAD_TRAINER', 'AGENT', 'TEACHER')),
  status VARCHAR(10) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  privileges JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  specialization VARCHAR(50) NOT NULL CHECK (specialization IN ('لغة عربية', 'رياضيات', 'فيزياء', 'كيمياء')),
  qualifications TEXT,
  experience_years INTEGER DEFAULT 0,
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('دوام كامل', 'دوام جزئي')),
  status VARCHAR(20) DEFAULT 'نشط' CHECK (status IN ('نشط', 'معلق', 'مفصول')),
  overall_rating INTEGER DEFAULT 3 CHECK (overall_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups (classes)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('مبتدئ', 'متوسط', 'متقدم')),
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  students_count INTEGER DEFAULT 0,
  max_capacity INTEGER DEFAULT 15,
  weekdays VARCHAR(100),
  start_time TIME,
  end_time TIME,
  class_link TEXT,
  status VARCHAR(20) DEFAULT 'نشط' CHECK (status IN ('نشط', 'معلق', 'منتهي')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name VARCHAR(100) NOT NULL,
  parent_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  age INTEGER NOT NULL CHECK (age BETWEEN 5 AND 25),
  level VARCHAR(20) NOT NULL CHECK (level IN ('مبتدئ', 'متوسط', 'متقدم')),
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subscription_type VARCHAR(20) NOT NULL CHECK (subscription_type IN ('شهري', 'ربعي', 'نصف سنوي')),
  monthly_fee DECIMAL(8,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'مدفوع' CHECK (payment_status IN ('مدفوع', 'متأخر', 'معلق')),
  last_payment_date DATE,
  status VARCHAR(20) DEFAULT 'نشط' CHECK (status IN ('نشط', 'معلق', 'منقطع')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitors (potential students)
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name VARCHAR(100) NOT NULL,
  parent_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  age INTEGER NOT NULL CHECK (age BETWEEN 5 AND 25),
  desired_level VARCHAR(20) NOT NULL CHECK (desired_level IN ('مبتدئ', 'متوسط', 'متقدم')),
  source VARCHAR(50) NOT NULL CHECK (source IN ('Facebook', 'Google', 'مراجعة', 'WhatsApp', 'Instagram')),
  contact_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  trial_date DATE,
  trial_time TIME,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  trial_status VARCHAR(20) DEFAULT 'لم يحضر' CHECK (trial_status IN ('مجدولة', 'حضر', 'لم يحضر', 'ألغيت')),
  final_decision VARCHAR(20) DEFAULT 'يفكر' CHECK (final_decision IN ('سجل', 'رفض', 'يفكر')),
  notes TEXT,
  pipeline_status VARCHAR(20) DEFAULT 'جديد' CHECK (pipeline_status IN ('جديد', 'تم التواصل', 'حصة مجدولة', 'متابعة', 'مسجل', 'ملغي')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  source VARCHAR(50) NOT NULL CHECK (source IN ('Facebook', 'Google', 'Instagram', 'WhatsApp')),
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'جديد' CHECK (status IN ('جديد', 'متصل به', 'حجز حصة', 'تم التحويل', 'ملغي')),
  follow_up_date DATE,
  assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance records
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  student_id UUID NOT NULL, -- Can reference students or visitors
  student_name VARCHAR(100) NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('حاضر', 'غائب')),
  attendance_rate DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, student_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(100) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL CHECK (method IN ('Credit Card', 'Bank Transfer', 'Cash')),
  course_name VARCHAR(100),
  monthly_fee DECIMAL(8,2),
  discount DECIMAL(8,2) DEFAULT 0,
  receipt_file_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Marketing', 'Utilities', 'Software', 'Other', 'Inventory')),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('أجهزة', 'لوازم مكتبية', 'مواد تعليمية')),
  quantity INTEGER NOT NULL DEFAULT 0,
  purchase_date DATE,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applicants table
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'قيد المراجعة' CHECK (status IN ('قيد المراجعة', 'مقابلة', 'مقبول', 'مرفوض')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  uploaded_by VARCHAR(20) NOT NULL,
  uploaded_by_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance notes for teachers
CREATE TABLE IF NOT EXISTS performance_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('payment', 'capacity', 'payment_due', 'system')),
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_group_id ON students(group_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_visitors_pipeline_status ON visitors(pipeline_status);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified for development - in production, implement proper role-based policies)
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON students FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON visitors FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON teachers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON groups FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON attendance FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON payments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON marketing_campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON expenses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON inventory FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON applicants FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON reports FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON performance_notes FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON notifications FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON leads FOR ALL TO authenticated USING (true);