# Triply - Supabase Setup Guide

## Prerequisites
1. Supabase account (free tier) at https://supabase.com
2. Node.js (only for local development if using Supabase CLI)

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose a name (e.g., "triply"), region (closest to you), database password
4. Wait for project creation (~1-2 minutes)

## Step 2: Apply Database Schema

### Option A: Using Supabase Dashboard (Easiest)

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run**
6. Wait for confirmation (all tables created)

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-id YOUR_PROJECT_ID

# Apply migrations
supabase db push
```

## Step 3: Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - `Project URL` (e.g., https://xxxx.supabase.co)
   - `Anon Key` (public key for client-side)
   - `Service Role Key` (keep secret!)

## Step 4: Configure App

### For Web Development (Current Setup)

1. Create `.env.local` in project root:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. For now, set localStorage fallback in `js/supabase-client.js`:
```javascript
localStorage.setItem('sb_url', 'https://your-project-id.supabase.co');
localStorage.setItem('sb_key', 'your-anon-key-here');
```

### For Production (Vercel/Firebase Hosting)

Set environment variables in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Step 5: Update Manifest & Test

1. Update `manifest.json` to handle share URLs:
```json
{
  "share_target": {
    "action": "/",
    "method": "GET",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "group_share": "group_share"
    }
  }
}
```

2. Open the app in browser
3. You should see login screen instead of the old Rhodos planner

## Troubleshooting

### "supabase is not defined"
Make sure to add Supabase script tag to index.html:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### "Row Level Security (RLS)" errors
Make sure RLS policies are applied in migrations. Check Supabase dashboard:
- **Authentication** → **Policies** 
- Verify policies are created for each table

### "No rows in response"
This is likely an RLS issue. Check:
1. Are you authenticated?
2. Does your user have permission to access the table?
3. Run policy test in Supabase dashboard

### Connection refused
- Check `VITE_SUPABASE_URL` is correct
- Verify you're in the right Supabase project
- Check network connectivity

## Next Steps

1. **Auth UI** - Build login/signup screens
2. **Trip Management** - Create trip selection screen
3. **Activity Management** - Refactor localStorage to Supabase
4. **Groups** - Implement group creation and sharing
5. **TikTok Integration** - Update AI prompt for multi-destination

## Useful Supabase Links

- [JavaScript Client Docs](https://supabase.com/docs/reference/javascript/)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development)
