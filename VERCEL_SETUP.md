# Vercel Deployment Setup Guide

This guide will help you deploy your Customer Service AI Simulator to Vercel with Postgres metrics tracking.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier works)
- A [GitHub account](https://github.com/signup) (to host your repository)
- OpenAI API key (for AI features)

## Step 1: Push Code to GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Click **"Deploy"**

## Step 3: Set Up Vercel Postgres

1. In your Vercel project dashboard, go to the **"Storage"** tab
2. Click **"Create Database"** → **"Postgres"**
3. Choose a region close to your users
4. Click **"Create"**

Vercel will automatically:
- Create a Postgres database
- Add environment variables (POSTGRES_URL, etc.) to your project

## Step 4: Initialize Database Schema

1. Go to your Vercel Postgres dashboard
2. Click on **"Query"** tab
3. Copy and paste the entire contents of `schema.sql`
4. Click **"Execute"** to create all tables, indexes, and views

Alternatively, use Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
```

Then run the schema from your local machine:
```bash
psql $POSTGRES_URL < schema.sql
```

## Step 5: Set Environment Variables

In your Vercel project settings → **"Environment Variables"**, add:

### Required for AI Features:
```
OPENAI_API_KEY=sk-...your-key-here
```

### Automatically Added by Vercel Postgres:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

> ⚠️ **Important**: The `@vercel/postgres` package will automatically use these environment variables. No additional configuration needed!

## Step 6: Redeploy

After adding environment variables, redeploy your application:
1. Go to **"Deployments"** tab
2. Click on the latest deployment → **"Redeploy"**

OR

Trigger a new deployment by pushing to GitHub:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

## Step 7: Verify Deployment

1. Visit your deployed URL (e.g., `https://your-app.vercel.app`)
2. Start a contact and complete the workflow
3. Go to your Metrics Dashboard (button in header)
4. Verify that metrics are being tracked

## Monitoring Metrics

To query your metrics database:
1. Go to Vercel Dashboard → Your Project → **Storage** → **Postgres**
2. Click **"Query"** tab
3. Run queries to view your data:

```sql
-- View all contacts
SELECT * FROM contact_sessions ORDER BY started_at DESC LIMIT 10;

-- View AI events
SELECT * FROM ai_events ORDER BY timestamp DESC LIMIT 10;

-- View daily metrics
SELECT * FROM daily_metrics ORDER BY metric_date DESC;

-- View overall statistics
SELECT * FROM v_overall_stats;

-- View AI accuracy
SELECT * FROM v_ai_accuracy;
```

## Troubleshooting

### Database Connection Issues

If you see errors like "Connection refused" or "Cannot connect to database":

1. Make sure environment variables are set correctly
2. Check that your schema has been initialized
3. Verify that `@vercel/postgres` package is installed:
```bash
npm install @vercel/postgres
```

### API Route Errors

If API routes return 500 errors:

1. Check Vercel Function Logs:
   - Go to **Deployments** → Select deployment → **"View Function Logs"**

2. Common issues:
   - Missing `OPENAI_API_KEY` environment variable
   - Database tables not created (run `schema.sql`)
   - SQL syntax errors

### Metrics Not Tracking

1. Open browser DevTools → **Network** tab
2. Look for failed API calls to `/api/metrics/*`
3. Check console for errors
4. Verify database schema is initialized

## Local Development with Vercel Postgres

To test locally with production database:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link project and pull environment variables:
```bash
vercel link
vercel env pull .env.local
```

3. Start development server:
```bash
npm run dev
```

Your local app will now use the production Vercel Postgres database!

> ⚠️ **Warning**: Be careful when testing locally - you're writing to the production database!

## Environment Variables Reference

| Variable | Source | Purpose |
|----------|--------|---------|
| `OPENAI_API_KEY` | Manual | Required for AI features |
| `POSTGRES_URL` | Vercel | Database connection string |
| `POSTGRES_PRISMA_URL` | Vercel | Prisma-optimized connection |
| `POSTGRES_URL_NON_POOLING` | Vercel | Direct connection (migrations) |

## Database Schema Overview

**Tables:**
- `contact_sessions` - Each customer interaction
- `ai_events` - Individual AI decisions
- `daily_metrics` - Aggregated daily statistics
- `user_sessions` - Unique visitor tracking

**Views:**
- `v_recent_contacts` - Latest 100 contacts
- `v_ai_accuracy` - AI closure accuracy metrics
- `v_overall_stats` - Aggregate statistics

## Cost Considerations

**Vercel Free Tier Limits:**
- ✅ Serverless Functions: 100 GB-hours/month
- ✅ Bandwidth: 100 GB/month
- ✅ Postgres: 256 MB (Hobby tier - $0/month for hobby projects)

**Scaling:**
For production use, upgrade to:
- **Pro Plan** ($20/month) - More bandwidth, compute
- **Postgres Pro** ($24/month) - 512 MB database
- **Postgres Scale** - Up to 512 GB database

## Next Steps

1. ✅ Deploy application
2. ✅ Set up Postgres database
3. ✅ Initialize schema
4. ✅ Add environment variables
5. ✅ Test metrics tracking
6. 📊 Share your portfolio demo!

---

**Need Help?**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [@vercel/postgres SDK Reference](https://vercel.com/docs/storage/vercel-postgres/sdk)
