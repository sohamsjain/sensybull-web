# Deploying to Vercel - Complete Guide

This guide will walk you through deploying your Sensybull landing page to Vercel in just a few minutes.

## Prerequisites

- A GitHub/GitLab/Bitbucket account (or use Vercel CLI)
- Your Sensybull website code ready
- Logo and app screenshots added to `/public/images/`

## Method 1: Deploy via GitHub (Recommended for Teams)

### Step 1: Push to GitHub

If you haven't already, initialize git and push to GitHub:

```bash
cd sensybull-landing

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Sensybull landing page"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/sensybull-landing.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in (you can use GitHub login)
3. Click **"Add New Project"**
4. Select **"Import Git Repository"**
5. Choose your `sensybull-landing` repository
6. Click **"Import"**

### Step 3: Configure Project

Vercel will automatically detect Next.js settings. You can keep the defaults:

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

Click **"Deploy"**!

### Step 4: Wait for Deployment

- Vercel will install dependencies
- Build your project
- Deploy to their global CDN
- Usually takes 1-2 minutes

### Step 5: Your Site is Live!

You'll get a URL like: `https://sensybull-landing.vercel.app`

You can:
- Visit the URL to see your live site
- Set up a custom domain (see below)
- Enable automatic deployments on git push

## Method 2: Deploy via Vercel CLI (Fastest)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

Enter your email and verify the login.

### Step 3: Deploy

```bash
cd sensybull-landing
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Select your account**
- Link to existing project? **No**
- What's your project's name? **sensybull-landing**
- In which directory is your code? **./** (press Enter)
- Want to override settings? **No**

That's it! Your site will be deployed in seconds.

### Step 4: Production Deployment

For production deployment (not preview):

```bash
vercel --prod
```

## Method 3: Deploy via Drag & Drop

### Step 1: Build Locally

```bash
cd sensybull-landing
npm run build
```

### Step 2: Create Deployment Package

The `.next` folder contains your built site. However, for drag & drop:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select "Deploy with Vercel CLI" and follow CLI instructions (Method 2 above)

**Note**: Drag & drop works best with static exports. For full Next.js features, use GitHub or CLI methods.

## Setting Up a Custom Domain

### Step 1: Go to Project Settings

1. In Vercel dashboard, open your project
2. Go to **Settings** → **Domains**

### Step 2: Add Domain

1. Click **"Add"**
2. Enter your domain (e.g., `sensybull.com`)
3. Click **"Add"**

### Step 3: Configure DNS

Vercel will show you DNS records to add:

**If using Vercel nameservers (easiest):**
- Point your domain's nameservers to Vercel's nameservers
- Vercel handles everything automatically

**If using your own DNS:**
- Add an A record: `76.76.21.21`
- Or add a CNAME record: `cname.vercel-dns.com`

### Step 4: Wait for DNS Propagation

Usually takes 5-30 minutes. Vercel will automatically provision SSL certificates.

## Environment Variables (If Needed)

If you have any environment variables:

1. Go to **Settings** → **Environment Variables**
2. Add your variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_GOOGLE_ANALYTICS`
   - etc.
3. Redeploy the project

## Automatic Deployments

Once connected to GitHub:

- **Every push to main branch** → Production deployment
- **Every PR** → Preview deployment
- **Every branch** → Branch preview

This is automatic! No configuration needed.

## Deployment Checklist

Before deploying, make sure:

- [ ] All your images are in `/public/images/`
- [ ] Logo and screenshots are optimized
- [ ] All links are updated (App Store, social media)
- [ ] Contact email is correct
- [ ] Meta tags are updated in `app/layout.tsx`
- [ ] Test locally: `npm run build && npm start`
- [ ] All environment variables are set (if needed)

## Post-Deployment Tasks

After deploying:

1. **Test on mobile devices** - Check responsiveness
2. **Test all links** - Ensure they work
3. **Check loading speed** - Use PageSpeed Insights
4. **Set up analytics** - Add Google Analytics if needed
5. **Share the URL** - Send to team for review

## Monitoring Your Deployment

### View Deployment Logs

1. Go to Vercel dashboard
2. Click on your deployment
3. View **"Build Logs"** for any errors

### Check Performance

Vercel provides automatic analytics:
- Page load times
- Visitor statistics
- Error tracking

Go to **Analytics** tab in your project dashboard.

## Troubleshooting

### Build Failed

Check build logs for errors. Common issues:

- Missing dependencies: `npm install` locally and commit `package-lock.json`
- TypeScript errors: Fix errors shown in logs
- Image path errors: Ensure all paths start with `/`

### Images Not Loading

- Ensure images are in `/public/images/`
- Check image paths don't have leading `./`
- Use `/images/filename.png` not `./images/filename.png`

### Styles Not Working

- Clear cache: `rm -rf .next`
- Rebuild: `npm run build`
- Ensure `globals.css` is imported in `layout.tsx`

### Custom Domain Not Working

- Check DNS settings in your domain registrar
- Wait 24-48 hours for DNS propagation
- Verify DNS records: Use [DNS Checker](https://dnschecker.org/)

## Updating Your Site

### Method 1: Via Git

```bash
# Make changes to your code
git add .
git commit -m "Update hero section"
git push

# Vercel automatically rebuilds and deploys!
```

### Method 2: Via Vercel CLI

```bash
# Make changes
vercel --prod
```

## Rollback to Previous Version

If something goes wrong:

1. Go to Vercel dashboard
2. Click **"Deployments"**
3. Find a working deployment
4. Click **"..."** → **"Promote to Production"**

## Advanced: Preview Deployments

Every git branch gets its own preview URL:

```bash
git checkout -b new-feature
# Make changes
git push origin new-feature
```

Vercel creates a unique preview URL for testing before merging.

## Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

## Quick Deploy Command

Once set up, deploying updates is just:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel handles the rest automatically! 🚀
