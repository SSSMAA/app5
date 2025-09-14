-- SQL Schema for ISCHOOLGO Supabase Backend

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------
-- ENUM Types
-- -------------------------------------------------

CREATE TYPE user_role AS ENUM ('ADMIN', 'DIRECTOR', 'MARKETER', 'HEAD_TRAINER', 'AGENT', 'TEACHER');
CREATE TYPE user_status AS ENUM ('Active', 'Inactive');
CREATE TYPE lead_status AS ENUM ('جديد', 'متصل به', 'حجز حصة', 'تم التحويل', 'ملغي');
CREATE TYPE lead_source AS ENUM ('Facebook', 'Google', 'Instagram', 'WhatsApp');
CREATE TYPE student_level AS ENUM ('مبتدئ', 'متوسط', 'متقدم');
CREATE TYPE subscription_type AS ENUM ('شهري', 'ربعي', 'نصف سنوي');
CREATE TYPE payment_status AS ENUM ('مدفوع', 'متأخر', 'معلق');
CREATE TYPE student_status AS ENUM ('نشط', 'معلق', 'منقطع');
CREATE TYPE payment_method AS ENUM ('Credit Card', 'Bank Transfer', 'Cash');
CREATE TYPE teacher_specialization AS ENUM ('لغة عربية', 'رياضيات', 'فيزياء', 'كيمياء');
CREATE TYPE teacher_contract_type AS ENUM ('دوام كامل', 'دوام جزئي');
CREATE TYPE teacher_hr_status AS ENUM ('نشط', 'معلق', 'مفصول');
CREATE TYPE group_class_status AS ENUM ('نشط', 'معلق', 'منتهي');
CREATE TYPE expense_category AS ENUM ('Marketing', 'Utilities', 'Software', 'Other', 'Inventory');
CREATE TYPE inventory_item_category AS ENUM ('أجهزة', 'لوازم مكتبية', 'مواد تعليمية');
CREATE TYPE applicant_status AS ENUM ('قيد المراجعة', 'مقابلة', 'مقبول', 'مرفوض');
CREATE TYPE notification_type AS ENUM ('payment', 'capacity', 'payment_due');
CREATE TYPE visitor_source AS ENUM ('Facebook', 'Google', 'مراجعة', 'WhatsApp', 'Instagram');
CREATE TYPE visitor_trial_status AS ENUM ('مجدولة', 'حضر', 'لم يحضر', 'ألغيت');
CREATE TYPE visitor_final_decision AS ENUM ('سجل', 'رفض', 'يفكر');
CREATE TYPE visitor_pipeline_status AS ENUM ('جديد', 'تم التواصل', 'حصة مجدولة', 'متابعة', 'مسجل', 'ملغي');
CREATE TYPE attendance_status AS ENUM ('حاضر', 'غائب');


-- -------------------------------------------------
-- Tables
-- -------------------------------------------------

-- Profiles Table (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'Active'
);

-- Campaigns Table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads Table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    source lead_source,
    status lead_status NOT NULL DEFAULT 'جديد',
    received_date DATE NOT NULL,
    follow_up_date DATE,
    notes TEXT,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Teachers Table (detailed HR info)
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    specialization teacher_specialization,
    qualifications TEXT,
    experience_years INT,
    hire_date DATE,
    salary NUMERIC(10, 2),
    contract_type teacher_contract_type,
    status teacher_hr_status NOT NULL DEFAULT 'نشط',
    overall_rating NUMERIC(2, 1),
    performance_notes JSONB
);

-- Group Classes Table
CREATE TABLE public.group_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    level student_level NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    students_count INT NOT NULL DEFAULT 0,
    max_capacity INT NOT NULL,
    weekdays TEXT,
    start_time TEXT,
    end_time TEXT,
    class_link TEXT,
    status group_class_status NOT NULL DEFAULT 'نشط',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Students Table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name TEXT NOT NULL,
    parent_name TEXT,
    phone_number TEXT NOT NULL,
    email TEXT,
    age INT,
    level student_level NOT NULL,
    group_id UUID REFERENCES public.group_classes(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    registration_date DATE NOT NULL,
    subscription_type subscription_type,
    monthly_fee NUMERIC(10, 2),
    payment_status payment_status NOT NULL DEFAULT 'معلق',
    last_payment_date DATE,
    status student_status NOT NULL DEFAULT 'نشط',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Visitors Table
CREATE TABLE public.visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name TEXT NOT NULL,
    parent_name TEXT,
    phone_number TEXT NOT NULL,
    age INT,
    desired_level student_level,
    source visitor_source,
    contact_date DATE,
    assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    trial_date DATE,
    trial_time TEXT,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    group_id UUID REFERENCES public.group_classes(id) ON DELETE SET NULL,
    trial_status visitor_trial_status,
    final_decision visitor_final_decision,
    notes TEXT,
    pipeline_status visitor_pipeline_status,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    method payment_method NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0,
    receipt_file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance Table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.group_classes(id) ON DELETE CASCADE,
    status attendance_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Expenses Table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    category expense_category NOT NULL,
    description TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory Items Table
CREATE TABLE public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category inventory_item_category NOT NULL,
    quantity INT NOT NULL,
    purchase_date DATE,
    unit_price NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Applicants Table
CREATE TABLE public.applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    position TEXT,
    application_date DATE NOT NULL,
    status applicant_status NOT NULL DEFAULT 'قيد المراجعة',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Reports Table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    upload_date DATE NOT NULL,
    uploaded_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------
-- User Authentication and Profiles Trigger
-- -------------------------------------------------
-- This function is triggered when a new user signs up.
-- It creates a corresponding profile in the public.profiles table.
-- NOTE: It expects 'full_name', 'username', and 'role' to be present in the user's raw_user_meta_data.
-- These should be passed from the client during the sign-up process.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET SEARCH_PATH = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    (new.raw_user_meta_data->>'role')::user_role
  );
  RETURN new;
END;
$$;

-- Trigger to call the function when a new user is created
-- This will automatically create a profile for every new user.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -------------------------------------------------
-- Row Level Security (RLS) Policies
-- -------------------------------------------------
-- Note: Policies are restrictive. A user must match a policy to perform an action.
-- We define broad policies for admin-level roles and more specific policies for other roles.

-- Helper function to get the role of the current user from their profile
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE plpgsql
AS $$
DECLARE
  user_role_var user_role;
BEGIN
  -- Select the role from the profiles table for the currently authenticated user
  SELECT role INTO user_role_var FROM public.profiles WHERE id = auth.uid();
  RETURN user_role_var;
END;
$$;

-- -------------------------------------------------
-- Table: profiles
-- -------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admins can perform any action on any profile.
CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

-- Any authenticated user can view all profiles (e.g., for dropdowns).
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (true);

-- Users can only update their own profile.
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- -------------------------------------------------
-- Table: campaigns
-- -------------------------------------------------
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Admins, Directors, and Marketers have full control over campaigns.
CREATE POLICY "Admins, Directors, and Marketers can manage campaigns" ON public.campaigns
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR', 'MARKETER')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR', 'MARKETER'));

-- Agents need to see campaigns to associate leads with them.
CREATE POLICY "Agents can view campaigns" ON public.campaigns
FOR SELECT USING (get_user_role() = 'AGENT');

-- -------------------------------------------------
-- Table: leads
-- -------------------------------------------------
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Admins, Directors, and Marketers have full control over all leads.
CREATE POLICY "Admins, Directors, and Marketers can manage leads" ON public.leads
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR', 'MARKETER')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR', 'MARKETER'));

-- Agents can view all leads (to see unassigned leads).
CREATE POLICY "Agents can view all leads" ON public.leads
FOR SELECT USING (get_user_role() = 'AGENT');

-- Agents can insert new leads.
CREATE POLICY "Agents can insert new leads" ON public.leads
FOR INSERT WITH CHECK (get_user_role() = 'AGENT');

-- Agents can only update leads that are assigned to them.
CREATE POLICY "Agents can update their assigned leads" ON public.leads
FOR UPDATE USING (get_user_role() = 'AGENT' AND assigned_agent_id = auth.uid()) WITH CHECK (assigned_agent_id = auth.uid());

-- -------------------------------------------------
-- Table: teachers (HR Details)
-- -------------------------------------------------
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Admins, Directors, and Head Trainers can manage teacher HR details.
CREATE POLICY "Admins, Directors, and Head Trainers can manage teachers" ON public.teachers
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR', 'HEAD_TRAINER')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR', 'HEAD_TRAINER'));

-- Teachers can view and update their own HR details.
CREATE POLICY "Teachers can view and update their own profile" ON public.teachers
FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Any authenticated user can see a list of teachers.
CREATE POLICY "Authenticated users can view teacher list" ON public.teachers
FOR SELECT USING (true);

-- -------------------------------------------------
-- Table: group_classes
-- -------------------------------------------------
ALTER TABLE public.group_classes ENABLE ROW LEVEL SECURITY;

-- Admins, Directors, and Head Trainers have full control over groups.
CREATE POLICY "Admins, Directors, and Head Trainers can manage group classes" ON public.group_classes
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR', 'HEAD_TRAINER')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR', 'HEAD_TRAINER'));

-- Agents can view all groups to assign students.
CREATE POLICY "Agents can view group classes" ON public.group_classes
FOR SELECT USING (get_user_role() = 'AGENT');

-- Teachers can view the groups they are assigned to.
CREATE POLICY "Teachers can view their assigned group classes" ON public.group_classes
FOR SELECT USING (teacher_id = auth.uid());

-- Teachers can update their own group's info (e.g., class link).
CREATE POLICY "Teachers can update their assigned group classes" ON public.group_classes
FOR UPDATE USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- -------------------------------------------------
-- Table: students
-- -------------------------------------------------
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Admins, Directors, and Head Trainers have full control over students.
CREATE POLICY "Admins, Directors, and Head Trainers can manage students" ON public.students
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR', 'HEAD_TRAINER')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR', 'HEAD_TRAINER'));

-- Agents can create, read, and update students, but not delete them.
CREATE POLICY "Agents can manage students (no delete)" ON public.students
FOR SELECT, INSERT, UPDATE USING (get_user_role() = 'AGENT') WITH CHECK (get_user_role() = 'AGENT');

-- Teachers can only view students assigned to their groups or directly to them.
CREATE POLICY "Teachers can view their students" ON public.students
FOR SELECT USING (get_user_role() = 'TEACHER' AND (teacher_id = auth.uid() OR group_id IN (SELECT g.id FROM public.group_classes g WHERE g.teacher_id = auth.uid())));

-- -------------------------------------------------
-- Table: visitors
-- -------------------------------------------------
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Relevant staff can manage the visitor pipeline.
CREATE POLICY "Staff can manage visitors" ON public.visitors
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR', 'HEAD_TRAINER', 'AGENT')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR', 'HEAD_TRAINER', 'AGENT'));

-- Teachers can see visitors assigned to them for a trial class.
CREATE POLICY "Teachers can view their trial visitors" ON public.visitors
FOR SELECT USING (get_user_role() = 'TEACHER' AND teacher_id = auth.uid());

-- -------------------------------------------------
-- Table: payments
-- -------------------------------------------------
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Admins and Directors have full financial control over payments.
CREATE POLICY "Admins and Directors can manage payments" ON public.payments
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR'));

-- Agents can create, view, and update payments as per frontend requirements.
CREATE POLICY "Agents can manage payments" ON public.payments
FOR SELECT, INSERT, UPDATE USING (get_user_role() = 'AGENT') WITH CHECK (get_user_role() = 'AGENT');

-- -------------------------------------------------
-- Table: attendance
-- -------------------------------------------------
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Admins, Directors, and Head Trainers have full control over attendance.
CREATE POLICY "Admins, Directors, and Head Trainers can manage attendance" ON public.attendance
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR', 'HEAD_TRAINER')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR', 'HEAD_TRAINER'));

-- Agents can record and view attendance (e.g., for trial sessions).
CREATE POLICY "Agents can record and view attendance" ON public.attendance
FOR SELECT, INSERT USING (get_user_role() = 'AGENT') WITH CHECK (get_user_role() = 'AGENT');

-- Teachers can take and view attendance for their own groups.
CREATE POLICY "Teachers can manage attendance for their groups" ON public.attendance
FOR SELECT, INSERT USING (get_user_role() = 'TEACHER' AND group_id IN (SELECT id FROM public.group_classes WHERE teacher_id = auth.uid())) WITH CHECK (group_id IN (SELECT id FROM public.group_classes WHERE teacher_id = auth.uid()));

-- -------------------------------------------------
-- Table: expenses
-- -------------------------------------------------
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Admins and Directors have full control over expenses.
CREATE POLICY "Admins and Directors can manage all expenses" ON public.expenses
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR'));

-- Marketers can add and view expenses in the 'Marketing' category.
CREATE POLICY "Marketers can manage marketing expenses" ON public.expenses
FOR SELECT, INSERT USING (get_user_role() = 'MARKETER' AND category = 'Marketing') WITH CHECK (get_user_role() = 'MARKETER' AND category = 'Marketing');

-- -------------------------------------------------
-- Table: inventory_items
-- -------------------------------------------------
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Admins and Directors manage the inventory.
CREATE POLICY "Admins and Directors can manage inventory" ON public.inventory_items
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR'));

-- -------------------------------------------------
-- Table: applicants
-- -------------------------------------------------
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;

-- Admins and Directors manage the hiring pipeline.
CREATE POLICY "Admins and Directors can manage applicants" ON public.applicants
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR'));

-- -------------------------------------------------
-- Table: reports
-- -------------------------------------------------
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Admins and Directors can upload, update, and delete reports.
CREATE POLICY "Admins and Directors can manage reports" ON public.reports
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR'));

-- All authenticated users can view/download reports.
CREATE POLICY "Authenticated users can view reports" ON public.reports
FOR SELECT USING (true);

-- -------------------------------------------------
-- Table: notifications
-- -------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admins and Directors can manage notifications if needed.
CREATE POLICY "Admins and Directors can manage notifications" ON public.notifications
FOR ALL USING (get_user_role() IN ('ADMIN', 'DIRECTOR')) WITH CHECK (get_user_role() IN ('ADMIN', 'DIRECTOR'));

-- All authenticated users can read notifications. The frontend will filter.
CREATE POLICY "Authenticated users can view notifications" ON public.notifications
FOR SELECT USING (true);

-- -------------------------------------------------
-- Storage Buckets and RLS Policies
-- -------------------------------------------------

-- INSTRUCTIONS FOR MANUAL SETUP:
-- In your Supabase project dashboard, navigate to 'Storage' and create two buckets:
-- 1. `receipts`
-- 2. `reports`
-- The RLS policies below assume these buckets exist. Make them private, as access is controlled by these policies.

-- -------------------------------------------------
-- Policies for 'receipts' bucket
-- -------------------------------------------------

-- Allow ADMIN, DIRECTOR, AGENT to select (download) files from the 'receipts' bucket.
CREATE POLICY "Allow staff to select receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'receipts' AND get_user_role() IN ('ADMIN', 'DIRECTOR', 'AGENT'));

-- Allow ADMIN, DIRECTOR, AGENT to insert (upload) files into the 'receipts' bucket.
CREATE POLICY "Allow staff to insert receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts' AND get_user_role() IN ('ADMIN', 'DIRECTOR', 'AGENT'));

-- Note: UPDATE and DELETE policies for storage objects are not specified in the requirements.
-- To allow file updates and deletions, you would add corresponding policies. For example:
-- CREATE POLICY "Allow staff to update receipts" ON storage.objects FOR UPDATE USING ( get_user_role() IN ('ADMIN', 'DIRECTOR', 'AGENT') AND bucket_id = 'receipts' );
-- CREATE POLICY "Allow staff to delete receipts" ON storage.objects FOR DELETE USING ( get_user_role() IN ('ADMIN', 'DIRECTOR', 'AGENT') AND bucket_id = 'receipts' );

-- -------------------------------------------------
-- Policies for 'reports' bucket
-- -------------------------------------------------

-- Allow any authenticated user to select (download) files from the 'reports' bucket.
CREATE POLICY "Allow all authenticated users to select reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reports');

-- Allow ADMIN, DIRECTOR to insert (upload) files into the 'reports' bucket.
-- This aligns with the RLS on the `reports` table where these roles have full control.
CREATE POLICY "Allow admins and directors to insert reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reports' AND get_user_role() IN ('ADMIN', 'DIRECTOR'));

-- -------------------------------------------------
-- Cron Job for Daily Notifications
-- -------------------------------------------------

-- INSTRUCTIONS FOR MANUAL SETUP:
-- To run the notification generation logic automatically every day,
-- you need to set up a Cron Job in your Supabase project.
--
-- 1. Deploy the `generate-notifications` function to your Supabase project:
--    - Run `supabase functions deploy generate-notifications` using the Supabase CLI.
--
-- 2. Schedule the function to run daily:
--    - Go to your Supabase project dashboard.
--    - In the left sidebar, go to 'Edge Functions'.
--    - Select the `generate-notifications` function and in its details, find the 'Cron schedule' option.
--    - Set a schedule, for example `0 0 * * *` to run it every day at midnight UTC.
--
-- This will ensure that notifications for late payments, upcoming payments,
-- and group capacity are generated automatically each day.
