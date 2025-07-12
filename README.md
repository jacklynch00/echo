# Echo

## Environment Variables Setup for Vercel

To fix Google OAuth redirects in production, add these environment variables in your Vercel dashboard:

### Required Environment Variables:

1. `NEXT_PUBLIC_SITE_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
2. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### Steps to add in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
    - `NEXT_PUBLIC_SITE_URL` = `https://your-app.vercel.app`
    - `NEXT_PUBLIC_SUPABASE_URL` = `your-supabase-url`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-supabase-anon-key`

### Supabase OAuth Configuration:

1. Go to your Supabase dashboard
2. Navigate to Authentication → URL Configuration
3. Add your production URL to:
    - Site URL: `https://your-app.vercel.app`
    - Redirect URLs: `https://your-app.vercel.app/api/auth/callback`

## Development

```bash
npm run dev
```

## Deployment

The application is automatically deployed to Vercel when you push to the main branch.
