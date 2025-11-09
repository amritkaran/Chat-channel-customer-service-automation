# 🚀 Deployment Guide

This guide will help you deploy your AI Customer Service Simulator to the public web securely.

## 📋 Prerequisites

1. **GitHub Account** - [Sign up here](https://github.com/signup)
2. **Vercel Account** - [Sign up here](https://vercel.com/signup)
3. **OpenAI API Key** - Get it from [platform.openai.com](https://platform.openai.com/api-keys)

---

## 🔐 Option A: Secure Deployment (Recommended)

This method uses serverless API routes to keep your OpenAI API key secure.

### Step 1: Set Up OpenAI Usage Limits

**IMPORTANT:** Do this FIRST to protect yourself from unexpected charges!

1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. Click "Limits" in the sidebar
3. Set a **monthly budget limit** (recommended: $5-$10 for a demo)
4. Enable **email notifications** for usage alerts

### Step 2: Push to GitHub

```bash
# Navigate to your project directory
cd "C:\Users\AD\Desktop\Customer Service Chat bot"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - AI Customer Service Simulator"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com) and log in**

2. **Click "Add New..." → "Project"**

3. **Import your GitHub repository**

4. **Configure Project:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (should be auto-detected)
   - Output Directory: `dist` (should be auto-detected)

5. **Add Environment Variable:**
   - Click "Environment Variables"
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (starts with `sk-`)
   - Click "Add"

6. **Click "Deploy"** and wait 1-2 minutes

7. **Your site will be live!** You'll get a URL like `https://your-project.vercel.app`

### Step 4: Update Your Portfolio Links

Update the placeholder links in your WelcomeScreen:

1. Open `src/components/WelcomeScreen.jsx`
2. Find the GitHub links (search for `https://github.com/yourusername/project`)
3. Replace with your actual GitHub repository URL
4. Replace LinkedIn and Portfolio URLs with your actual links

```jsx
// Example:
<a href="https://github.com/yourname/ai-customer-service" target="_blank" rel="noopener noreferrer">
  View on GitHub
</a>
```

5. Commit and push the changes:

```bash
git add .
git commit -m "Update portfolio links"
git push
```

Vercel will automatically redeploy!

---

## ⚡ Option B: Quick Deploy (Less Secure)

**Warning:** This exposes your API key in the browser. Only use for quick demos with strict usage limits!

### Steps:

1. **Set OpenAI Usage Limit** (see Step 1 above) - **DO THIS FIRST!**

2. **Deploy to Vercel:**

```bash
npm install -g vercel
vercel login
vercel
```

3. **Add Environment Variable in Vercel Dashboard:**
   - Go to your project settings
   - Add `VITE_LLM_API_KEY` with your OpenAI key
   - Redeploy

---

## 🌐 Alternative: Deploy to Netlify

### Steps:

1. **Install Netlify CLI**

```bash
npm install -g netlify-cli
```

2. **Build your project**

```bash
npm run build
```

3. **Deploy**

```bash
netlify deploy --prod
```

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add `OPENAI_API_KEY` with your key

---

## 📊 Monitoring Your Deployment

### Check OpenAI Usage:
- Go to [platform.openai.com/usage](https://platform.openai.com/usage)
- Monitor daily API costs
- Check if you're approaching your limit

### Check Vercel Analytics:
- Go to your Vercel dashboard
- Click on your project
- View "Analytics" tab for traffic stats

---

## 🔒 Security Best Practices

### ✅ DO:
- Set monthly spending limits on OpenAI
- Use serverless API routes (Option A)
- Keep `.env` files in `.gitignore`
- Monitor usage regularly
- Update links before sharing publicly

### ❌ DON'T:
- Commit `.env` files to GitHub
- Share your API key publicly
- Skip setting usage limits
- Use `dangerouslyAllowBrowser: true` in production

---

## 🐛 Troubleshooting

### "API key not configured" error:
- Check environment variable name: `OPENAI_API_KEY` (not `VITE_LLM_API_KEY`)
- Redeploy after adding environment variables
- Check Vercel logs for errors

### Build fails:
- Run `npm install` locally first
- Ensure `package.json` has all dependencies
- Check Vercel build logs for specific errors

### CORS errors:
- The `api/` functions already handle CORS
- If issues persist, check browser console for details

---

## 📝 Post-Deployment Checklist

- [ ] OpenAI usage limits set
- [ ] Project deployed to Vercel/Netlify
- [ ] Environment variables configured
- [ ] Portfolio links updated with real URLs
- [ ] Test the demo end-to-end
- [ ] Share your demo link! 🎉

---

## 💡 Sharing Your Project

Once deployed, you can share:

**Portfolio:** Add to your portfolio site with description
**LinkedIn:** Post with demo link and description of AI techniques
**GitHub:** Update README with live demo link
**Resume:** Add project with deployed URL

**Example LinkedIn Post:**
```
🚀 Just built an AI-powered customer service simulator using React and OpenAI!

Key features:
✨ Semantic embeddings for closure detection (text-embedding-3-small)
🤖 LLM intent classification (GPT-4o-mini)
⏱️ Adaptive timers based on customer satisfaction
💡 Transparent AI decision-making with Inspector mode

Try the live demo: [your-vercel-url]
View the code: [your-github-url]

#AI #MachineLearning #React #OpenAI #WebDev
```

---

## 🆘 Need Help?

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **OpenAI Docs:** [platform.openai.com/docs](https://platform.openai.com/docs)
- **GitHub Docs:** [docs.github.com](https://docs.github.com)

Good luck with your deployment! 🚀
