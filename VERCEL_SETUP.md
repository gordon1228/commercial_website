# Vercel Deployment Setup Guide

## Environment Variables Required for Vercel

You need to set these environment variables in your Vercel project dashboard:

### 1. Database Configuration
```
DATABASE_URL="postgresql://postgres.cynvuexwnnfuhrncfmrn:4K%21j4JhxEWz%3Fk.Q@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### 2. Supabase API Keys
```
NEXT_PUBLIC_SUPABASE_URL="https://cynvuexwnnfuhrncfmrn.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bnZ1ZXh3bm5mdWhybmNmbXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NzE3NDQsImV4cCI6MjA3MjQ0Nzc0NH0.iBD-cFlUjA0J5eYnhxYXiHY1cO9FralAe25LBr9ajEE"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bnZ1ZXh3bm5mdWhybmNmbXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg3MTc0NCwiZXhwIjoyMDcyNDQ3NzQ0fQ.jIpZ8ky2AIjepeBjmyN7KTlZgji9oyv-ygx_oLuCpLc"
```

### 3. NextAuth Configuration (CRITICAL - This fixes the redirect loop!)
```
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
NEXTAUTH_SECRET="HNLjtjOjs8lhUo9QR/PvwQpn+7t95rXp3nDMg2JlB3k="
```

**IMPORTANT**: Replace `your-vercel-domain.vercel.app` with your actual Vercel deployment URL!

### 4. Optional Environment Variables
```
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1
SESSION_SECURE=true
SESSION_MAX_AGE=28800
SESSION_UPDATE_AGE=900
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"
HSTS_MAX_AGE=31536000
X_FRAME_OPTIONS="SAMEORIGIN"
ENABLE_REGISTRATION=false
ENABLE_SOCIAL_LOGIN=false
MAINTENANCE_MODE=false
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable with its value
5. Make sure to set them for all environments (Production, Preview, Development)

## Fixing the Redirect Loop

The redirect loop issue was caused by:
1. `NEXTAUTH_URL` being set to `localhost:3000` instead of the production domain
2. NextAuth getting confused about the proper base URL for redirects

**Solution**: Set `NEXTAUTH_URL` to your actual Vercel domain in the environment variables.

## Admin Login Credentials

For testing, use these credentials:
- Email: `admin@elitefleet.com`
- Password: `admin123`

## Deployment Checklist

- [ ] All environment variables set in Vercel dashboard
- [ ] `NEXTAUTH_URL` points to production domain
- [ ] Database connection is working
- [ ] Build completes successfully
- [ ] Admin login works without redirect loops