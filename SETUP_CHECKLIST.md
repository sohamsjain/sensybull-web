# Sensybull Landing Page - Setup Checklist

Use this checklist to set up and deploy your Sensybull landing page. Check off each item as you complete it.

## Phase 1: Initial Setup

### Installation
- [ ] Navigate to the project directory: `cd sensybull-landing`
- [ ] Install dependencies: `npm install`
- [ ] Verify installation: `npm run dev`
- [ ] Open http://localhost:3000 to see the site

### Assets Preparation
- [ ] Prepare your Sensybull logo (PNG, 200x60px recommended)
- [ ] Prepare app screenshots (at least 3-4 images)
  - [ ] Main hero screenshot (1920x1080px)
  - [ ] Swipeable cards interface screenshot
  - [ ] Stock detail page screenshot
  - [ ] Watchlist view screenshot
- [ ] Create a demo video (optional, MP4 format)
- [ ] Create or download a favicon (32x32px or 64x64px)

### Add Your Assets
- [ ] Place logo in `/public/images/logo.png`
- [ ] Place app screenshots in `/public/images/`
  - [ ] `app-hero.png` (main screenshot)
  - [ ] `app-screenshot-1.png`
  - [ ] `app-screenshot-2.png`
  - [ ] `app-screenshot-3.png`
- [ ] Place favicon in `/public/favicon.ico`
- [ ] Optimize all images (compress with TinyPNG or similar)

## Phase 2: Content Customization

### Update Hero Section (`components/Hero.tsx`)
- [ ] Update main headline if needed
- [ ] Update subheadline
- [ ] Replace placeholder with your app screenshot:
  ```tsx
  <img src="/images/app-hero.png" alt="Sensybull App" />
  ```
- [ ] Update CTA button links (App Store, Play Store)
- [ ] Test video embed if you have a demo video

### Update Features Section (`components/Features.tsx`)
- [ ] Review feature descriptions
- [ ] Update any statistics (60s, 100%, etc.)
- [ ] Replace app demo screenshot
- [ ] Update example news card content if needed
- [ ] Verify all feature icons are appropriate

### Update FAQ Section (`components/FAQ.tsx`)
- [ ] Review all questions and answers
- [ ] Add any additional FAQs specific to Sensybull
- [ ] Remove any questions that don't apply
- [ ] Update contact information

### Update Download CTA (`components/DownloadCTA.tsx`)
- [ ] Update App Store link when ready
- [ ] Update Google Play Store link when ready
- [ ] Update "Coming Soon" badge if apps are live
- [ ] Verify trust indicators are accurate

### Update Footer (`components/Footer.tsx`)
- [ ] Update contact email to your actual email
- [ ] Add social media links (Twitter, LinkedIn)
- [ ] Update copyright year if needed
- [ ] Review disclaimer text
- [ ] Create and link Privacy Policy page
- [ ] Create and link Terms of Service page

### Update Header (`components/Header.tsx`)
- [ ] Decide if you want image logo or text logo
- [ ] If using image logo, add it
- [ ] Update navigation links if needed
- [ ] Test mobile menu functionality

### Update Metadata (`app/layout.tsx`)
- [ ] Update page title
- [ ] Update meta description
- [ ] Update keywords
- [ ] Add Open Graph image (for social sharing)
- [ ] Add any additional meta tags

## Phase 3: Testing

### Local Testing
- [ ] Test homepage on desktop browser
- [ ] Test all sections scroll smoothly
- [ ] Click all navigation links
- [ ] Test all CTA buttons
- [ ] Verify all images load correctly
- [ ] Test FAQ expand/collapse
- [ ] Test smooth scrolling to sections

### Responsive Testing
- [ ] Test on mobile viewport (375px width)
- [ ] Test on tablet viewport (768px width)
- [ ] Test on desktop viewport (1440px width)
- [ ] Check text is readable on all sizes
- [ ] Verify images scale properly
- [ ] Test mobile navigation

### Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge

### Performance Testing
- [ ] Run Lighthouse audit in Chrome DevTools
- [ ] Check page load speed
- [ ] Verify all images are optimized
- [ ] Check for any console errors

## Phase 4: Deployment Preparation

### Code Cleanup
- [ ] Remove any unused components
- [ ] Remove any console.log statements
- [ ] Fix any TypeScript errors: `npm run build`
- [ ] Review all TODO comments
- [ ] Update README with your specific instructions

### Pre-Deployment Checklist
- [ ] All placeholder content replaced with real content
- [ ] All links updated with real URLs
- [ ] All images added and optimized
- [ ] Meta tags updated
- [ ] Favicon added
- [ ] Build succeeds locally: `npm run build`
- [ ] Preview production build: `npm start`

### Version Control
- [ ] Initialize git: `git init`
- [ ] Review .gitignore file
- [ ] Add all files: `git add .`
- [ ] Initial commit: `git commit -m "Initial commit"`
- [ ] Create GitHub repository
- [ ] Push to GitHub: `git push -u origin main`

## Phase 5: Deployment to Vercel

### Choose Deployment Method
- [ ] Method 1: GitHub + Vercel (recommended) ✅
- [ ] Method 2: Vercel CLI ✅
- [ ] Method 3: Drag & Drop ✅

### Deploy via GitHub (Recommended)
- [ ] Sign up/login to Vercel
- [ ] Connect GitHub account
- [ ] Import your repository
- [ ] Configure project settings (use defaults)
- [ ] Click Deploy
- [ ] Wait for deployment to complete
- [ ] Visit your live site
- [ ] Test everything on the live site

### Or Deploy via CLI
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `vercel --prod`
- [ ] Visit your live site

## Phase 6: Post-Deployment

### Domain Setup (Optional)
- [ ] Purchase domain (if you don't have one)
- [ ] Go to Vercel project settings
- [ ] Add custom domain
- [ ] Configure DNS records
- [ ] Wait for SSL certificate provisioning
- [ ] Test custom domain

### Final Testing
- [ ] Test all pages on live site
- [ ] Test on actual mobile devices
- [ ] Test all external links
- [ ] Check page load speed
- [ ] Run PageSpeed Insights test
- [ ] Test social media sharing (og:image)

### Analytics & Monitoring
- [ ] Set up Google Analytics (optional)
- [ ] Set up Vercel Analytics
- [ ] Configure error tracking
- [ ] Set up uptime monitoring

### Launch Checklist
- [ ] Share URL with team for review
- [ ] Get stakeholder approval
- [ ] Prepare launch announcement
- [ ] Update all marketing materials with new URL
- [ ] Update App Store / Play Store listings with website URL

## Phase 7: Maintenance

### Regular Updates
- [ ] Set up automatic deployments (via GitHub)
- [ ] Monitor Vercel dashboard for issues
- [ ] Review analytics regularly
- [ ] Update content as app features change
- [ ] Keep dependencies updated: `npm update`

### Content Updates
- [ ] Update when app launches on stores
- [ ] Add new screenshots as app evolves
- [ ] Update FAQs based on user questions
- [ ] Refresh statistics and metrics

## Need Help?

Refer to these files for detailed instructions:
- `README.md` - Complete setup guide
- `DEPLOYMENT.md` - Detailed deployment instructions
- `PUBLIC_ASSETS.md` - Image placement guide

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Build for production
npm start               # Preview production build

# Deployment
vercel                  # Deploy to preview
vercel --prod          # Deploy to production

# Updates
git add .
git commit -m "Update"
git push               # Auto-deploys if connected to Vercel
```

---

**Estimated Time to Complete**: 2-3 hours (including testing)

**Priority Items**: Phases 1, 2, and 5 are essential for going live.

Good luck with your Sensybull launch! 🚀
