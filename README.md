# Sensybull Landing Website

A modern, responsive landing page for Sensybull - the smart financial news app for accredited investors.

## 🚀 Features

- **Modern Design**: Dark theme with gradient accents inspired by Syft.ai
- **Fully Responsive**: Optimized for all devices from mobile to desktop
- **Smooth Animations**: Built with Framer Motion for engaging interactions
- **SEO Optimized**: Proper meta tags and structured content
- **Fast Performance**: Built with Next.js 14 and optimized for speed
- **Easy Deployment**: One-click deploy to Vercel

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Vercel account (free tier works perfectly)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd sensybull-landing
npm install
```

### 2. Add Your Assets

Replace the placeholder content with your actual assets:

- **Logo**: Update the logo text in `components/Header.tsx` or add an image to `/public`
- **App Screenshots**: Place your app screenshots in `/public/images/`
- **Update Hero Section**: In `components/Hero.tsx`, replace the placeholder with:
  ```tsx
  <img 
    src="/images/your-screenshot.png" 
    alt="Sensybull App"
    className="w-full h-auto"
  />
  ```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

## 🌐 Deployment to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts and your site will be live!

### Option 2: Deploy via GitHub + Vercel Dashboard

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and deploy!

### Option 3: Deploy via Vercel Web Interface

1. Zip your project folder (exclude node_modules)
2. Go to [vercel.com](https://vercel.com) and drag/drop the zip
3. Vercel handles the rest!

## 📱 Customization Guide

### Update Content

1. **Hero Section**: Edit `components/Hero.tsx`
   - Update headlines, subheadlines
   - Add your video/screenshot

2. **Features**: Edit `components/Features.tsx`
   - Modify feature descriptions
   - Update statistics

3. **FAQ**: Edit `components/FAQ.tsx`
   - Add/remove questions
   - Update answers

4. **Footer**: Edit `components/Footer.tsx`
   - Update contact email
   - Add social media links

### Update Colors

Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  primary: {
    // Your custom color palette
    500: '#your-color',
  }
}
```

### Update Metadata

Edit `app/layout.tsx` to update SEO information:

```typescript
export const metadata: Metadata = {
  title: "Your Title",
  description: "Your Description",
  // Add more meta tags
};
```

## 🎨 Adding Your App Screenshots

### Step 1: Add Images to Public Folder

```
public/
  images/
    app-screenshot-1.png
    app-screenshot-2.png
    logo.png
```

### Step 2: Update Hero Component

```tsx
// In components/Hero.tsx
<img 
  src="/images/app-screenshot-1.png"
  alt="Sensybull App Interface"
  className="w-full h-auto rounded-2xl shadow-2xl"
/>
```

### Step 3: Create Image Gallery (Optional)

```tsx
<div className="grid grid-cols-3 gap-4">
  <img src="/images/app-screenshot-1.png" alt="Feature 1" />
  <img src="/images/app-screenshot-2.png" alt="Feature 2" />
  <img src="/images/app-screenshot-3.png" alt="Feature 3" />
</div>
```

## 📊 Project Structure

```
sensybull-landing/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main homepage
├── components/
│   ├── Header.tsx           # Navigation header
│   ├── Hero.tsx             # Hero section
│   ├── Features.tsx         # Features showcase
│   ├── FAQ.tsx              # FAQ section
│   ├── DownloadCTA.tsx      # Download CTA
│   └── Footer.tsx           # Footer
├── public/
│   └── images/              # Your images go here
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 🔧 Environment Variables (Optional)

Create a `.env.local` file for any environment-specific configs:

```bash
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_GOOGLE_ANALYTICS=your-ga-id
```

## 🚀 Performance Tips

1. **Image Optimization**: Use Next.js Image component for better performance
2. **Font Loading**: Inter font is already optimized via `next/font/google`
3. **Code Splitting**: Next.js automatically code-splits your routes
4. **Lazy Loading**: Framer Motion animations only load when needed

## 📱 App Store Links

Once your apps are live, update the download links:

```tsx
// In components/DownloadCTA.tsx
<a href="https://apps.apple.com/your-app">Download on iOS</a>
<a href="https://play.google.com/store/apps/details?id=your.app">Download on Android</a>
```

## 🆘 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Styling Issues

```bash
# Rebuild Tailwind
npm run dev
```

### Deployment Issues

- Check Vercel logs in the dashboard
- Ensure all environment variables are set
- Verify Node version compatibility

## 📝 License

This project is for Sensybull. All rights reserved.

## 🤝 Support

For questions or issues:
- Email: contact@sensybull.com
- Open an issue in this repository

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
