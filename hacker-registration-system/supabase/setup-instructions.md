# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: `hacker-registration-system`
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development

## 2. Get Project Credentials

After the project is created (takes ~2 minutes):

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Project API Keys** → **anon public** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Update Environment Variables

Update your `.env` file with the real credentials:

```env
# Replace these with your actual Supabase credentials
# DOG = Server URL, CAT = Client Key (for security obfuscation)
VITE_DOG=https://your-project-ref.supabase.co
VITE_CAT=your-actual-anon-key

# Application Configuration
VITE_APP_NAME=Hacker Registration System
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=true
VITE_ENABLE_EASTER_EGGS=true
```

## 4. Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** to execute the schema creation
5. Copy and paste the contents of `supabase/migrations/002_rls_policies.sql`
6. Click **Run** to execute the RLS policies

### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Push migrations:
   ```bash
   supabase db push
   ```

## 5. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/**` for development
   - **Email Templates**: Customize if needed (optional)

## 6. Verify Setup

After completing the setup, you can verify everything works by:

1. Starting your development server:
   ```bash
   npm run dev
   ```

2. The application should now connect to your real Supabase database
3. Try registering a new user to test the complete flow
4. Check the **Authentication** → **Users** tab in Supabase dashboard to see new users
5. Check the **Table Editor** to see the created tables and data

## 7. Security Considerations

- **Never commit your `.env` file** - it's already in `.gitignore`
- **Use environment-specific credentials** for different environments
- **Enable 2FA** on your Supabase account
- **Regularly rotate API keys** in production
- **Monitor usage** in the Supabase dashboard

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Double-check your credentials in `.env`
2. **CORS errors**: Make sure your site URL is configured correctly
3. **RLS policy errors**: Ensure all policies are applied correctly
4. **Migration errors**: Check the SQL syntax and run migrations in order

### Getting Help:

- Check the browser console for detailed error messages
- Review Supabase logs in the dashboard
- Consult the [Supabase documentation](https://supabase.com/docs)
- Check the project's README.md for additional troubleshooting tips