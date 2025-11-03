# Ashley AI Mobile - App Icon Creation Guide

**Quick Reference**: Create your app icons before building for production

## 📱 Required App Icons

### 1. Main App Icon (`icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency (transparent background)
- **Purpose**: Used for both iOS and Android app icon
- **Location**: `services/ash-mobile/assets/icon.png`

**Design Recommendations**:
- Simple, bold design that looks good at small sizes
- Ashley AI branding: Blue (#3B82F6) background with white "ASH" or "AI" text
- Or use your company logo
- Avoid text smaller than 44pt
- Avoid fine details (won't be visible when scaled down)

### 2. Splash Screen (`splash.png`)
- **Size**: 1242x2436 pixels (iPhone 12 Pro Max resolution)
- **Format**: PNG
- **Background Color**: White (#FFFFFF) - matches app.json
- **Purpose**: Loading screen shown while app starts
- **Location**: `services/ash-mobile/assets/splash.png`

**Design Recommendations**:
- Center your logo/icon
- White or light background
- Simple and clean
- Matches your brand colors

### 3. Android Adaptive Icon (`adaptive-icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Purpose**: Android adaptive icon foreground layer
- **Location**: `services/ash-mobile/assets/adaptive-icon.png`
- **Note**: Background color set to #FFFFFF in app.json

**Important for Android**:
- The center 66% (684x684px) of the icon is always visible
- Outer edges may be cropped on some launchers
- Design should work with circular, rounded square, or square masks

### 4. Favicon (`favicon.png`)
- **Size**: 48x48 pixels
- **Format**: PNG
- **Purpose**: Web browser icon (for web version)
- **Location**: `services/ash-mobile/assets/favicon.png`

---

## 🎨 Quick Creation Methods

### Option 1: Professional Design Tool

**Using Figma/Adobe Illustrator/Photoshop**:

1. Create 1024x1024px canvas
2. Design your icon:
   ```
   Background: Blue gradient (#3B82F6 to #2563EB)
   Text: "ASH" or "AI" in bold white font
   Add subtle shadow or 3D effect
   ```
3. Export as PNG with transparency
4. Save as `icon.png`

### Option 2: Online Icon Generator

**Use Expo's Icon Generator**:
1. Go to https://www.appicon.co/ or https://icon.kitchen/
2. Upload your base design (minimum 512x512)
3. Generate all required sizes
4. Download and extract
5. Copy files to `services/ash-mobile/assets/`

### Option 3: Use Canva (Free)

1. Go to https://www.canva.com
2. Create custom size: 1024x1024
3. Design your icon:
   - Add blue square background
   - Add white text "ASH" or company logo
   - Add subtle effects
4. Download as PNG
5. Repeat for splash screen (1242x2436)

### Option 4: Simple Placeholder (For Testing)

Create a simple colored square with text:

1. Open any image editor
2. Create 1024x1024 canvas
3. Fill with #3B82F6 (Ashley AI blue)
4. Add white "ASH" text in center (size 400pt)
5. Save as PNG
6. Copy to all four required files

---

## 📁 File Structure

Place all files in this exact structure:

```
services/ash-mobile/assets/
├── icon.png           (1024x1024) - Main app icon
├── splash.png         (1242x2436) - Splash screen
├── adaptive-icon.png  (1024x1024) - Android adaptive icon
└── favicon.png        (48x48)     - Web favicon
```

---

## ✅ Validation Checklist

Before building for production:

- [ ] `icon.png` exists and is 1024x1024
- [ ] `splash.png` exists and is 1242x2436
- [ ] `adaptive-icon.png` exists and is 1024x1024
- [ ] `favicon.png` exists and is 48x48
- [ ] All files are PNG format
- [ ] Icon looks good at small sizes (test by viewing at 48x48)
- [ ] Colors match your brand
- [ ] No copyright violations (if using stock images)

---

## 🎯 Quick Ashley AI Branded Icon Template

If you want a simple Ashley AI branded icon right now:

### Design Specs:
```
Background: Solid #3B82F6 (Ashley AI blue)
OR: Gradient from #3B82F6 to #2563EB (top to bottom)

Center Text: "ASH"
Font: Inter/Roboto/SF Pro Bold
Size: 400pt (for 1024x1024 canvas)
Color: White (#FFFFFF)
Alignment: Center both horizontally and vertically

Optional: Add subtle shadow (0px 4px 8px rgba(0,0,0,0.2))
```

### For Splash Screen:
```
Background: White (#FFFFFF)

Center Icon: Same as app icon but 512x512
Position: Center of canvas
Add text below: "Ashley AI" in blue (#3B82F6)
Font size: 48pt
```

---

## 🚀 After Creating Icons

Once you have all four icon files ready:

1. Place them in `services/ash-mobile/assets/`
2. Verify file names match exactly
3. Run the app to preview:
   ```bash
   cd services/ash-mobile
   pnpm start
   ```
4. Check icon appears correctly in Expo Go
5. Ready to build for production!

---

## 🆘 Need Help?

**Can't design icons?**
- Hire a freelance designer on Fiverr ($5-20)
- Use Canva templates (free)
- Ask a colleague with design skills
- Use simple colored square with text (temporary)

**File size too large?**
- Use TinyPNG (https://tinypng.com/) to compress
- Keep under 1MB per file
- Maintain exact pixel dimensions

**Want professional icons?**
- Consider hiring a professional designer
- Budget: $50-200 for complete icon set
- Turnaround: 1-3 days typically

---

**Ready to build?** Once icons are in place, proceed to deployment guide!

