<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ISCHOOLGO Management System

A comprehensive school management system built with React, Vite, and Supabase.

## 🌐 Live Application
**https://3000-i2uhqpp7miqap95oa1ej3-6532622b.e2b.dev**

## 🚀 Quick Start

Run the quick start script to see current status and next steps:
```bash
node quick-start.js
```

## 👥 Test Users

The system includes 6 test users for different roles:

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@ischoolgo.com | password123 |
| DIRECTOR | director@ischoolgo.com | password123 |
| MARKETER | marketer@ischoolgo.com | password123 |
| HEAD_TRAINER | headtrainer@ischoolgo.com | password123 |
| AGENT | agent@ischoolgo.com | password123 |
| TEACHER | teacher@ischoolgo.com | password123 |

### Create Test Users
```bash
# Automated creation
npm run create-users

# Verify users
npm run verify-users
```

## 🛠️ Development

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## 📚 Documentation

- **TEST_USERS_COMPLETE_GUIDE.md** - Complete user creation guide
- **DEPLOYMENT_STATUS.md** - Current deployment status  
- **DEPLOYMENT_GUIDE.md** - Full deployment instructions
- **MANUAL_USER_CREATION_GUIDE.md** - Manual user creation steps

## 🗄️ Backend Setup

The application requires Supabase backend setup. See `DEPLOYMENT_STATUS.md` for details.
