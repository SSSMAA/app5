# Complete Test Users Creation Guide

## Overview

This guide provides both **automated** and **manual** methods for creating the 6 required test users for ISCHOOLGO application testing.

## 📋 Required Test Users

| Role | Email | Full Name | Username | Password |
|------|-------|-----------|----------|----------|
| ADMIN | admin@ischoolgo.com | Admin User | admin | password123 |
| DIRECTOR | director@ischoolgo.com | Director User | director | password123 |
| MARKETER | marketer@ischoolgo.com | Marketer User | marketer | password123 |
| HEAD_TRAINER | headtrainer@ischoolgo.com | Head Trainer User | headtrainer | password123 |
| AGENT | agent@ischoolgo.com | Agent User | agent | password123 |
| TEACHER | teacher@ischoolgo.com | Teacher User | teacher | password123 |

## 🤖 Method 1: Automated Script (Recommended)

### Prerequisites
- Supabase backend must be set up first (schema.sql executed)
- Node.js environment with the project dependencies

### Running the Automated Script

1. **Navigate to project directory**
   ```bash
   cd /home/user/webapp
   ```

2. **Run the user creation script**
   ```bash
   node create-test-users.js
   ```

3. **Verify users were created**
   ```bash
   node verify-test-users.js
   ```

### Expected Output
```
🚀 Starting test user creation process...

Creating user: admin@ischoolgo.com (ADMIN)...
✅ Successfully created user: admin@ischoolgo.com
   - User ID: 12345678-1234-1234-1234-123456789012
   - Email confirmed: No

Creating user: director@ischoolgo.com (DIRECTOR)...
✅ Successfully created user: director@ischoolgo.com
...

📊 Test User Creation Summary:
✅ Successful: 6
❌ Failed: 0
📝 Total: 6

🎉 All test users created successfully!
```

## 👋 Method 2: Manual Creation (Supabase Dashboard)

If the automated script fails or you prefer manual creation, follow the detailed manual guide in `MANUAL_USER_CREATION_GUIDE.md`.

### Quick Manual Steps Summary:

1. **Go to Supabase Dashboard**: https://rlvlvcwehcbqvxjwoqhq.supabase.co
2. **Create Auth User**: Authentication → Users → Add user
3. **Copy User UID**: Click on user to see details, copy the UID
4. **Create Profile**: Table Editor → profiles → Insert row
5. **Match UID**: Use the same UID from step 3 as the profile ID
6. **Repeat for all 6 users**

## 🔍 Verification & Testing

### After Creating Users

1. **Run verification script** (if using automated method):
   ```bash
   node verify-test-users.js
   ```

2. **Manual verification**:
   - Visit: https://3000-i2uhqpp7miqap95oa1ej3-6532622b.e2b.dev
   - Try logging in with each account
   - Verify role-specific features work correctly

### Testing Each Role

**ADMIN Role Test:**
- Login: admin@ischoolgo.com / password123
- Should have access to all features
- Can manage users, view all data

**DIRECTOR Role Test:**
- Login: director@ischoolgo.com / password123  
- Should have management access
- Can view financial data, manage staff

**MARKETER Role Test:**
- Login: marketer@ischoolgo.com / password123
- Should have marketing features
- Can manage campaigns, view leads

**HEAD_TRAINER Role Test:**
- Login: headtrainer@ischoolgo.com / password123
- Should have training management
- Can manage teachers, classes

**AGENT Role Test:**
- Login: agent@ischoolgo.com / password123
- Should have student management
- Can register students, take payments

**TEACHER Role Test:**
- Login: teacher@ischoolgo.com / password123
- Should have limited access
- Can view assigned classes, take attendance

## 🚨 Troubleshooting

### Common Issues

1. **"User already exists" error**
   - Check if user exists in Authentication → Users
   - If exists but can't login, check if profile exists in profiles table

2. **Login fails with correct credentials**
   - Verify profile exists in Table Editor → profiles
   - Check that profile `id` matches auth user UID exactly

3. **User logs in but has no permissions**
   - Check the `role` field in the profile table
   - Ensure role is uppercase: ADMIN, DIRECTOR, etc.

4. **Profile creation trigger not working**
   - Create profile manually using Method 2
   - Ensure schema.sql was executed completely

### SQL Troubleshooting Queries

```sql
-- Check auth users
SELECT email, id, created_at FROM auth.users 
WHERE email LIKE '%ischoolgo.com';

-- Check profiles
SELECT id, full_name, username, role, status 
FROM public.profiles;

-- Find auth users without profiles
SELECT u.email, u.id 
FROM auth.users u 
LEFT JOIN public.profiles p ON u.id = p.id 
WHERE p.id IS NULL AND u.email LIKE '%ischoolgo.com';
```

## 📁 Related Files

- `create-test-users.js` - Automated user creation script
- `verify-test-users.js` - User verification script  
- `MANUAL_USER_CREATION_GUIDE.md` - Detailed manual instructions
- `schema.sql` - Database schema (must be executed first)

## ✅ Success Criteria

After successful user creation:

- ✅ All 6 users can login successfully
- ✅ Each user has correct role and permissions
- ✅ Users appear in both auth.users and profiles tables
- ✅ Role-specific features work as expected
- ✅ No authentication or authorization errors

## 🎯 Next Steps

Once all test users are created and verified:

1. **Test Role Permissions**: Login as each user type and verify access
2. **Create Sample Data**: Add some test students, classes, payments
3. **Test Core Features**: Registration, payment processing, attendance
4. **Verify Reports**: Check that data shows correctly for each role
5. **Test Notifications**: Verify the notification system works

The application should now be fully functional with proper user roles and permissions!