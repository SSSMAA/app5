# ISCHOOLGO Deployment Guide

This document provides comprehensive instructions for deploying the ISCHOOLGO School Management System to various hosting platforms.

## 🚀 Quick Deployment Options

### Option 1: Netlify (Recommended)

1. Fork/Clone the repository: `https://github.com/SSSMAA/app5.git`
2. Sign up at [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Choose GitHub and select your repository
5. Build settings:
   - **Build command**: `npm ci && npm run build`
   - **Publish directory**: `dist`
6. Environment variables (set in Netlify dashboard):
   - `VITE_SUPABASE_URL`: `https://rlvlvcwehcbqvxjwoqhq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdmx2Y3dlaGNicXZ4andvcWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc4NTMsImV4cCI6MjA3MzQ0Mzg1M30.8lwuGi_XD4digdJqBOoMIqEUfHNE9SYg1OIWWVALvHI`
7. Click "Deploy site"

**Netlify configuration is already included** in `netlify.toml`.

### Option 2: Vercel

1. Fork/Clone the repository: `https://github.com/SSSMAA/app5.git`
2. Sign up at [Vercel](https://vercel.com)
3. Click "New Project"
4. Import from GitHub and select your repository
5. Framework preset: **Vite**
6. Environment variables:
   - `VITE_SUPABASE_URL`: `https://rlvlvcwehcbqvxjwoqhq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdmx2Y3dlaGNicXZ4andvcWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc4NTMsImV4cCI6MjA3MzQ0Mzg1M30.8lwuGi_XD4digdJqBOoMIqEUfHNE9SYg1OIWWVALvHI`
7. Click "Deploy"

**Vercel configuration is already included** in `vercel.json`.

### Option 3: Render.com

1. Fork/Clone the repository: `https://github.com/SSSMAA/app5.git`
2. Sign up at [Render](https://render.com)
3. Click "New Static Site"
4. Connect your GitHub repository
5. Use the included `render.yaml` configuration
6. Deploy automatically

**Render configuration is already included** in `render.yaml`.

### Option 4: Cloudflare Pages

1. Fork/Clone the repository: `https://github.com/SSSMAA/app5.git`
2. Sign up at [Cloudflare](https://dash.cloudflare.com)
3. Go to Pages → Create a project
4. Connect to Git and select your repository
5. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
6. Environment variables:
   - `VITE_SUPABASE_URL`: `https://rlvlvcwehcbqvxjwoqhq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdmx2Y3dlaGNicXZ4andvcWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc4NTMsImV4cCI6MjA3MzQ0Mzg1M30.8lwuGi_XD4digdJqBOoMIqEUfHNE9SYg1OIWWVALvHI`

**Cloudflare configuration is already included** in `wrangler.toml`.

## 🗄️ Supabase Backend Setup

The Supabase backend is already configured, but you need to set up the database schema and storage buckets:

### 1. Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and execute the entire contents of `schema.sql`
4. This will create all tables, triggers, and security policies

### 2. Storage Buckets

1. Navigate to Storage in Supabase dashboard
2. Create two **private** buckets:
   - `receipts`
   - `reports`

### 3. Edge Function (Optional)

1. Navigate to Edge Functions
2. Create a new function named `generate-notifications`
3. Copy the code from `supabase/functions/generate-notifications/index.ts`
4. Deploy the function

### 4. Cron Job (Optional)

1. Navigate to Database → Cron Jobs
2. Create a new job to run the `generate-notifications` function daily
3. Schedule: `0 0 * * *` (daily at midnight)

## 👥 Test Users

The following test users are already created and ready to use:

| Role | Username | Email | Password |
|------|----------|--------|----------|
| ADMIN | admin | admin@ischoolgo.com | password123 |
| DIRECTOR | director | director@ischoolgo.com | password123 |
| MARKETER | marketer | marketer@ischoolgo.com | password123 |
| HEAD_TRAINER | headtrainer | headtrainer@ischoolgo.com | password123 |
| AGENT | agent | agent@ischoolgo.com | password123 |
| TEACHER | teacher | teacher@ischoolgo.com | password123 |

## 🔧 Local Development

To run the application locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/SSSMAA/app5.git
   cd app5
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```
   VITE_SUPABASE_URL=https://rlvlvcwehcbqvxjwoqhq.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdmx2Y3dlaGNicXZ4andvcWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc4NTMsImV4cCI6MjA3MzQ0Mzg1M30.8lwuGi_XD4digdJqBOoMIqEUfHNE9SYg1OIWWVALvHI
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173

## 📦 Manual Deployment

To build and deploy manually:

1. Build the application:
   ```bash
   npm run build
   ```

2. The `dist` folder contains all static files

3. Upload the `dist` folder contents to any static hosting service

## 🛠️ Configuration Files

The repository includes configuration files for multiple platforms:

- `netlify.toml` - Netlify configuration
- `vercel.json` - Vercel configuration  
- `render.yaml` - Render.com configuration
- `wrangler.toml` - Cloudflare Pages configuration
- `schema.sql` - Complete database schema
- `create-test-users.js` - Script to create test users

## 📞 Support

If you encounter any issues during deployment:

1. Check that all environment variables are correctly set
2. Ensure the Supabase schema has been executed
3. Verify that storage buckets are created and configured as private
4. Test with the provided test user accounts

## 🔒 Security Notes

- The Supabase anon key is safe to expose in the frontend
- The service role key should only be used server-side (in the test user creation script)
- All database operations are protected by Row Level Security (RLS) policies
- File uploads are controlled by storage bucket policies