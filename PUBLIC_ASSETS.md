# Public Assets Guide

## Where to Place Your Assets

All your static assets should go in the `/public` directory. Here's the recommended structure:

```
public/
├── images/
│   ├── logo.png                    # Your Sensybull logo
│   ├── logo-white.png             # White version for dark backgrounds
│   ├── app-hero.png               # Main hero screenshot (1920x1080px recommended)
│   ├── app-screenshot-1.png       # Swipeable cards interface
│   ├── app-screenshot-2.png       # Stock detail page
│   ├── app-screenshot-3.png       # Watchlist view
│   ├── app-demo-video.mp4        # Optional: Demo video
│   └── favicon.ico                # Browser favicon
└── videos/
    └── demo.mp4                   # App demo video (if you have one)
```

## Recommended Image Sizes

- **Logo**: 200x60px (PNG with transparent background)
- **Hero Screenshot**: 1920x1080px or 16:9 aspect ratio
- **App Screenshots**: 1170x2532px (iPhone dimensions) or similar mobile aspect ratio
- **Favicon**: 32x32px or 64x64px

## How to Use Your Images

### 1. Add Your Logo

Option A: Replace text logo in `components/Header.tsx`:
```tsx
<Link href="/" className="flex items-center space-x-2">
  <img src="/images/logo.png" alt="Sensybull" className="h-8 md:h-10" />
</Link>
```

Option B: Keep text logo and just update the gradient text in the component (current setup)

### 2. Add Hero Screenshot

In `components/Hero.tsx`, replace the placeholder:
```tsx
<div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
  <img 
    src="/images/app-hero.png"
    alt="Sensybull App Interface"
    className="w-full h-auto"
  />
</div>
```

### 3. Add Feature Screenshots

In `components/Features.tsx`, find the app demo section:
```tsx
<div className="aspect-[9/16] bg-slate-950 rounded-xl">
  <img 
    src="/images/app-screenshot-1.png"
    alt="Swipeable Cards Interface"
    className="w-full h-full object-cover"
  />
</div>
```

### 4. Add Video Demo (Optional)

If you have a demo video, you can embed it in the Hero section:
```tsx
<video 
  className="w-full rounded-2xl shadow-2xl"
  controls
  poster="/images/app-hero.png"
>
  <source src="/videos/demo.mp4" type="video/mp4" />
</video>
```

### 5. Add Favicon

Simply place `favicon.ico` in the `/public` folder and Next.js will automatically use it.

## Image Optimization Tips

1. **Compress your images** before uploading (use tools like TinyPNG or Squoosh)
2. **Use WebP format** for better compression (Next.js Image component handles this)
3. **Provide alt text** for accessibility
4. **Use Next.js Image component** for automatic optimization:

```tsx
import Image from 'next/image';

<Image
  src="/images/app-screenshot-1.png"
  alt="App Screenshot"
  width={1170}
  height={2532}
  className="rounded-xl"
/>
```

## Quick Setup Checklist

- [ ] Add logo to `/public/images/logo.png`
- [ ] Add main hero screenshot to `/public/images/app-hero.png`
- [ ] Add at least 3 app screenshots
- [ ] Update image paths in components (Hero.tsx, Features.tsx)
- [ ] Add favicon.ico to `/public`
- [ ] Test all images load correctly in dev mode
- [ ] Optimize images for web (compress, resize)

## Need More Help?

Check the README.md for detailed instructions on updating each component!
