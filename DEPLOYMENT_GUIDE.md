# ISCHOOLGO Deployment Guide

## Frontend Deployment to Cloudflare Pages

Since automatic deployment requires API tokens, please follow these manual steps:

### 1. Connect to Cloudflare Pages
1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect your GitHub account
3. Select the repository: `SSSMAA/app5`
4. Choose the branch: `feat/ischoolgo-supabase-backend`

### 2. Configure Build Settings
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty)

### 3. Environment Variables
Set these environment variables in the Cloudflare Pages project settings:
```
VITE_SUPABASE_URL=https://rlvlvcwehcbqvxjwoqhq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdmx2Y3dlaGNicXZ4andvcWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc4NTMsImV4cCI6MjA3MzQ0Mzg1M30.8lwuGi_XD4digdJqBOoMIqEUfHNE9SYg1OIWWVALvHI
```

## Supabase Backend Setup (Manual Steps Required)

### 1. Execute Database Schema
1. Go to your Supabase project: https://rlvlvcwehcbqvxjwoqhq.supabase.co
2. Navigate to SQL Editor
3. Copy and paste the entire content of `schema.sql`
4. Execute the SQL script

### 2. Create Storage Buckets
1. Navigate to Storage in Supabase dashboard
2. Create two **private** buckets:
   - `receipts`
   - `reports`

### 3. Deploy Edge Function
1. Navigate to Edge Functions in Supabase dashboard
2. Create a new function named `generate-notifications`
3. Copy the code from `supabase/functions/generate-notifications/index.ts`
4. Paste and deploy the function

### 4. Set Up Cron Job
1. Navigate to Database → Cron Jobs
2. Create new job named "Daily Notification Generation"
3. Schedule: `0 0 * * *` (daily at midnight)
4. Select the `generate-notifications` function

## Testing After Deployment
1. Access the deployed URL
2. Create a test user through the sign-up form
3. Log in with the test user
4. Verify database connectivity and functionality

## Project Files
- Database schema: `schema.sql`
- Edge function: `supabase/functions/generate-notifications/index.ts`
- Frontend build output: `dist/`