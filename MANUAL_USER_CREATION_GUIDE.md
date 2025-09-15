# Manual Test User Creation Guide

## Overview

This guide provides step-by-step instructions for manually creating test users in the Supabase dashboard. You need to create users for all 6 roles to fully test the ISCHOOLGO application.

## ⚠️ Important Two-Step Process

**CRITICAL**: You must follow a two-step process because the automatic profile creation trigger may not work initially:

1. **Step 1**: Create the authentication user
2. **Step 2**: Manually create the corresponding profile record

## Test Users to Create

| Role | Email | Full Name | Username | Password |
|------|-------|-----------|----------|----------|
| ADMIN | admin@ischoolgo.com | Admin User | admin | password123 |
| DIRECTOR | director@ischoolgo.com | Director User | director | password123 |
| MARKETER | marketer@ischoolgo.com | Marketer User | marketer | password123 |
| HEAD_TRAINER | headtrainer@ischoolgo.com | Head Trainer User | headtrainer | password123 |
| AGENT | agent@ischoolgo.com | Agent User | agent | password123 |
| TEACHER | teacher@ischoolgo.com | Teacher User | teacher | password123 |

## Detailed Step-by-Step Instructions

### Step 1: Create Authentication User

1. **Go to Supabase Dashboard**
   - Visit: https://rlvlvcwehcbqvxjwoqhq.supabase.co
   - Log in to your Supabase account

2. **Navigate to Authentication**
   - In the left sidebar, click on **"Authentication"**
   - Click on **"Users"** tab

3. **Add New User**
   - Click the **"Add user"** button
   - Fill in the form:
     - **Email**: Use the email from the table above (e.g., `admin@ischoolgo.com`)
     - **Password**: `password123`
     - **Confirm Password**: `password123`
   - Click **"Create user"**

4. **Copy the User UID**
   - After creation, click on the newly created user in the list
   - **IMPORTANT**: Copy the **User UID** (long string at the top)
   - You'll need this for Step 2

### Step 2: Create User Profile

1. **Navigate to Table Editor**
   - In the left sidebar, click on **"Table Editor"**
   - Select the **"profiles"** table from the dropdown

2. **Insert New Profile**
   - Click the **"+ Insert row"** button
   - Fill in the form with these exact values:

   **For ADMIN user (example):**
   - **id**: Paste the User UID from Step 1
   - **full_name**: `Admin User`
   - **username**: `admin`
   - **role**: Select `ADMIN` from dropdown
   - **status**: Leave as `Active` (default)

3. **Save the Profile**
   - Click **"Save"** to create the profile record

### Repeat for All Users

**You must repeat both steps for each of the 6 test users:**

1. **ADMIN** (admin@ischoolgo.com)
2. **DIRECTOR** (director@ischoolgo.com)  
3. **MARKETER** (marketer@ischoolgo.com)
4. **HEAD_TRAINER** (headtrainer@ischoolgo.com)
5. **AGENT** (agent@ischoolgo.com)
6. **TEACHER** (teacher@ischoolgo.com)

## Verification Steps

After creating all users, verify they work correctly:

1. **Test Login**
   - Go to: https://3000-i2uhqpp7miqap95oa1ej3-6532622b.e2b.dev
   - Try logging in with each user account
   - Email: Use the email from table above
   - Password: `password123`

2. **Check Profile Data**
   - After login, verify that the user's role and name display correctly
   - Each role should have different permissions and menu access

## Troubleshooting

### If Login Fails:
1. **Check Authentication**: Verify the user exists in Authentication > Users
2. **Check Profile**: Verify the profile exists in Table Editor > profiles
3. **Check UID Match**: Ensure the profile `id` matches the auth user UID exactly

### If Profile is Missing:
1. The automatic trigger may not have worked
2. Manually create the profile using Step 2 above
3. Use the exact User UID from the authentication user

### Common Issues:
- **UID Mismatch**: Profile `id` must exactly match auth user UID
- **Role Typo**: Role must be exactly `ADMIN`, `DIRECTOR`, etc. (uppercase)
- **Username Conflict**: Each username must be unique

## SQL Alternative (Advanced)

If you prefer SQL, you can create profiles directly:

```sql
-- After creating auth users, insert profiles with their actual UUIDs
INSERT INTO public.profiles (id, full_name, username, role) VALUES 
('USER_UID_HERE', 'Admin User', 'admin', 'ADMIN');
-- Replace USER_UID_HERE with actual UID from auth.users
```

## Summary

- **6 users total** across all roles
- **Password**: `password123` for all users
- **Two-step process**: Auth user + Profile record
- **Critical**: UID must match between auth user and profile