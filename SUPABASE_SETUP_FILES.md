# Supabase Setup Files

## 1. Database Schema (schema.sql)

Copy and paste the following SQL into Supabase SQL Editor:

```sql
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

-- [Continue with all other tables from schema.sql...]
```

**Note:** The complete schema is in the file `schema.sql` - copy the entire content.

## 2. Edge Function Code

Function name: `generate-notifications`

Copy and paste this TypeScript code:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// [The complete function code from supabase/functions/generate-notifications/index.ts]
```

**Note:** The complete function code is in the file `supabase/functions/generate-notifications/index.ts`.

## 3. Storage Buckets to Create

Create these two **private** buckets in Supabase Storage:
- `receipts`
- `reports`

## 4. Cron Job Configuration

- **Name**: Daily Notification Generation
- **Schedule**: `0 0 * * *` (runs daily at midnight UTC)
- **Function**: `generate-notifications`