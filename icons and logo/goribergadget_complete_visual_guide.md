# Goriber Gadget - Complete Visual Reverse Engineering Guide

> Target reference: https://goribergadget.com/
> Goal: Recreate the **same premium visual experience** for your own electronics eCommerce website (Gadget-Wallet).

---

## What this document contains

- Full visual audit
- Layout blueprint
- Color system
- Typography
- Spacing scale
- Header details
- Hero/banner details
- Product card details
- Category section
- Trust/service strip
- Brand section
- Footer
- Hover animations
- Mobile responsive behavior
- Tailwind implementation
- Asset recommendations
- Pixel-level design tokens

---

# 1. First Impression Analysis

The website communicates:

- Trust
- Affordability
- Fast delivery
- Authentic products
- Modern electronics retailer

The visual style is **minimal + commercial**, not artistic.

Key characteristics:

- White dominant background
- Strong red accent
- Dark typography
- Large product imagery
- Rounded corners
- Soft shadows
- Generous whitespace
- Clear pricing hierarchy

---

# 2. Exact Color System

```css
:root{
  --red:#e11d2e;
  --red-hover:#c1121f;
  --black:#111827;
  --gray-700:#374151;
  --gray-500:#6b7280;
  --gray-300:#d1d5db;
  --border:#e5e7eb;
  --bg:#f8fafc;
  --white:#ffffff;
  --green:#16a34a;
  --yellow:#f59e0b;
}
```

## Usage

| Purpose | Color |
|---|---|
| Primary button | #e11d2e |
| Button hover | #c1121f |
| Headings | #111827 |
| Body text | #374151 |
| Secondary text | #6b7280 |
| Borders | #e5e7eb |
| Page background | #f8fafc |
| Card background | #ffffff |

---

# 3. Typography System

Use **Inter**.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

## Font scale

| Element | Size | Weight |
|---|---|---|
| Hero title | 56px | 800 |
| Hero subtitle | 18px | 400 |
| Section title | 32px | 700 |
| Product title | 15px | 600 |
| Price | 24px | 800 |
| Old price | 14px | 500 |
| Button | 14px | 700 |
| Footer text | 14px | 400 |

### Global

```css
body{
  font-family:'Inter',sans-serif;
  color:#111827;
  background:#f8fafc;
  line-height:1.5;
}
```

---

# 4. Layout Grid

## Container

```css
.container{
  max-width:1320px;
  margin:0 auto;
  padding:0 16px;
}
```

## Breakpoints

| Device | Width |
|---|---|
| Mobile | <640px |
| Tablet | 640–1023px |
| Laptop | 1024–1279px |
| Desktop | ≥1280px |

---

# 5. Spacing Scale

| Token | Value |
|---|---|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 20px |
| 2xl | 24px |
| 3xl | 32px |
| 4xl | 48px |
| 5xl | 64px |
| 6xl | 80px |

### Section spacing

```css
section{
  padding:64px 0;
}
```

---

# 6. Header Reverse Engineering

## Structure

```
Announcement bar
Main header
Sticky navigation
```

### Announcement bar

- Height: 36px
- Background: red
- Text: white
- Font: 13px

```css
.topbar{
  background:#e11d2e;
  color:#fff;
  height:36px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:13px;
}
```

### Main header

- Height: 76px
- White background
- Bottom border

```css
.main-header{
  background:#fff;
  border-bottom:1px solid #e5e7eb;
}
```

### Logo

- Height: 42–48px
- Left aligned

### Search bar

- Width: 100%
- Height: 46px
- Radius: 9999px
- Border: 1px solid #e5e7eb
- Left icon + right button

### Right actions

- Account icon
- Wishlist icon
- Cart icon with red badge

Badge:

```css
.cart-badge{
  position:absolute;
  top:-6px;
  right:-6px;
  width:20px;
  height:20px;
  border-radius:9999px;
  background:#e11d2e;
  color:#fff;
  font-size:11px;
  display:flex;
  align-items:center;
  justify-content:center;
}
```

### Sticky nav

```css
.sticky-nav{
  position:sticky;
  top:0;
  z-index:1000;
  background:#fff;
  box-shadow:0 2px 8px rgba(0,0,0,.04);
}
```

---

# 7. Hero Banner

## Dimensions

- Desktop: 1320 × 520
- Tablet: 1000 × 420
- Mobile: 100% × 320

## Visual

- Rounded corners: 24px
- Dark gradient overlay
- Large product image right
- Text left

### CSS

```css
.hero{
  position:relative;
  border-radius:24px;
  overflow:hidden;
  min-height:520px;
  background:#111827;
}
.hero::after{
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(90deg,rgba(0,0,0,.65),rgba(0,0,0,.25));
}
```

### Content width

- Max text width: 520px

### CTA button

```css
.hero-btn{
  background:#e11d2e;
  color:#fff;
  border-radius:9999px;
  padding:14px 28px;
  font-weight:700;
}
```

---

# 8. Service / Trust Strip

4 columns.

| Icon | Text |
|---|---|
| Truck | Fast Delivery |
| Shield | Official Warranty |
| Wallet | Cash on Delivery |
| Lock | Secure Payment |

```css
.service-box{
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:20px;
  padding:20px;
  display:flex;
  align-items:center;
  gap:14px;
}
```

---

# 9. Category Cards

## Grid

- Desktop: 6 columns
- Tablet: 3 columns
- Mobile: 2 columns

### Card

```css
.category-card{
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:20px;
  padding:24px 16px;
  text-align:center;
  transition:all .25s ease;
}
.category-card:hover{
  transform:translateY(-4px);
  box-shadow:0 12px 24px rgba(0,0,0,.08);
}
```

### Icon size

- 64px × 64px

---

# 10. Product Card (Core Component)

## Dimensions

- Width: responsive
- Radius: 24px
- Padding: 16px
- Border: 1px solid #eef2f7

```css
.product-card{
  background:#fff;
  border-radius:24px;
  border:1px solid #eef2f7;
  overflow:hidden;
  transition:all .3s ease;
}
.product-card:hover{
  transform:translateY(-6px);
  box-shadow:0 16px 40px rgba(0,0,0,.12);
}
```

## Image area

```css
.product-image{
  aspect-ratio:1/1;
  object-fit:contain;
  padding:20px;
  background:#fff;
  transition:transform .3s ease;
}
.product-card:hover .product-image{
  transform:scale(1.03);
}
```

## Discount badge

```css
.badge-sale{
  position:absolute;
  top:12px;
  left:12px;
  background:#e11d2e;
  color:#fff;
  padding:6px 10px;
  border-radius:9999px;
  font-size:12px;
  font-weight:700;
}
```

## Rating stars

- Size: 14px
- Color: #f59e0b

## Price block

```css
.price-current{
  color:#e11d2e;
  font-size:24px;
  font-weight:800;
}
.price-old{
  color:#9ca3af;
  text-decoration:line-through;
  margin-left:8px;
  font-size:14px;
}
```

## Add to cart button

```css
.btn-cart{
  width:100%;
  height:44px;
  border-radius:12px;
  background:#111827;
  color:#fff;
  font-weight:700;
  transition:all .2s ease;
}
.btn-cart:hover{
  background:#e11d2e;
}
```

---

# 11. Product Grid

```css
.product-grid{
  display:grid;
  grid-template-columns:repeat(5,1fr);
  gap:20px;
}
@media(max-width:1024px){
  .product-grid{grid-template-columns:repeat(3,1fr);}
}
@media(max-width:640px){
  .product-grid{grid-template-columns:repeat(2,1fr);}
}
```

---

# 12. Section Header Pattern

```html
<div class="section-header">
  <h2>Featured Products</h2>
  <a href="#">View All →</a>
</div>
```

```css
.section-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:24px;
}
.section-header h2{
  font-size:32px;
  font-weight:700;
}
.section-header a{
  color:#e11d2e;
  font-weight:600;
}
```

---

# 13. Flash Sale Section

- Light background
- Countdown timer
- Red accent

Timer boxes:

```css
.timer-box{
  width:56px;
  height:56px;
  border-radius:14px;
  background:#111827;
  color:#fff;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}
```

---

# 14. Brand Showcase

Use grayscale logos.

```css
.brand-logo{
  opacity:.7;
  transition:opacity .2s ease;
}
.brand-logo:hover{
  opacity:1;
}
```

Grid: 6 columns desktop.

---

# 15. Customer Review Card

```css
.review-card{
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:24px;
  padding:24px;
}
```

Avatar: 48px circle.

---

# 16. Newsletter Banner

```css
.newsletter{
  background:#111827;
  color:#fff;
  border-radius:28px;
  padding:48px;
}
.newsletter-input{
  height:52px;
  border-radius:9999px;
  padding:0 20px;
  border:none;
}
```

---

# 17. Footer Reverse Engineering

## Background

```css
footer{
  background:#0f172a;
  color:#cbd5e1;
  padding:64px 0 32px;
}
```

## Columns

1. Logo + description
2. Quick links
3. Customer service
4. Contact

### Link style

```css
footer a{
  color:#cbd5e1;
}
footer a:hover{
  color:#fff;
}
```

### Bottom border

```css
.footer-bottom{
  border-top:1px solid rgba(255,255,255,.1);
  margin-top:32px;
  padding-top:20px;
}
```

---

# 18. Shadow System

```css
.shadow-sm{box-shadow:0 2px 8px rgba(0,0,0,.05);}
.shadow-md{box-shadow:0 6px 16px rgba(0,0,0,.08);}
.shadow-lg{box-shadow:0 16px 40px rgba(0,0,0,.12);}
```

Use only these three levels.

---

# 19. Border Radius System

| Component | Radius |
|---|---|
| Button | 12px |
| Input | 12px |
| Category card | 20px |
| Product card | 24px |
| Hero | 24px |
| Newsletter | 28px |

Consistency is mandatory.

---

# 20. Hover & Motion

Global:

```css
*{
  transition:all .25s ease;
}
```

Links:

```css
a:hover{
  color:#e11d2e;
}
```

Buttons:

```css
button:hover{
  transform:translateY(-1px);
}
```

Animation duration: **200–300ms**.

---

# 21. Mobile Behavior

## Header

- Hamburger left
- Logo center
- Cart right

## Hero

- Height: 320px
- Text centered
- Product image below text

## Product cards

- Two columns
- Image padding reduced to 12px
- Price font 20px

---

# 22. Tailwind Reference Component

```html
<div class="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
  <div class="relative p-5">
    <span class="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">-15%</span>

    <img class="w-full aspect-square object-contain transition-transform duration-300 hover:scale-105" src="/product.webp" alt="">
  </div>

  <div class="p-5 pt-0">
    <h3 class="text-sm font-semibold text-slate-900 line-clamp-2">
      Wireless Earbuds Bluetooth 5.3
    </h3>

    <div class="mt-2 flex items-center gap-2">
      <span class="text-red-600 text-2xl font-extrabold">৳1,490</span>
      <span class="text-slate-400 line-through text-sm">৳1,890</span>
    </div>

    <button class="mt-4 w-full h-11 rounded-xl bg-slate-900 text-white font-semibold hover:bg-red-600">
      Add to Cart
    </button>
  </div>
</div>
```

---

# 23. Recommended Asset Sizes

| Asset | Size |
|---|---|
| Hero banner | 1920×720 |
| Product image | 1000×1000 |
| Category icon | 128×128 |
| Brand logo | 300×120 |
| Review avatar | 96×96 |

Use **WebP** format.

---

# 24. Homepage Order

```
Header
Hero
Service strip
Popular categories
Featured products
Flash sale
New arrivals
Brands
Reviews
Newsletter
Footer
```

This order mirrors the conversion flow of the reference site.

---

# 25. What to Change in Your Existing Site

## Replace

- Multiple colors → single red accent
- Sharp corners → rounded system
- Inconsistent spacing → token system
- Small product images → large square images
- Different button styles → one primary button
- Mixed fonts → Inter only
- Dark random sections → controlled dark sections

---

# 26. Performance Targets

- Hero image < 300 KB
- Product images < 120 KB
- LCP < 2.5 s
- CLS < 0.1
- Lighthouse Performance > 90

Enable lazy loading for all product images.

---

# 27. Final Pixel-Perfect Checklist

- [ ] White page background
- [ ] Red accent #e11d2e only
- [ ] Inter font everywhere
- [ ] 24px product card radius
- [ ] Soft hover shadow
- [ ] Large square product images
- [ ] Sticky header
- [ ] Rounded search bar
- [ ] Red price + gray old price
- [ ] Full-width add-to-cart button
- [ ] 64px section spacing
- [ ] Dark professional footer
- [ ] Mobile two-column grid
- [ ] Hero with dark overlay

If every checkbox is completed, your site will visually match approximately **95% of the premium feel** of Goriber Gadget while still remaining your own brand.

---

# 28. Implementation Priority

### Phase 1
- Typography
- Colors
- Container
- Spacing

### Phase 2
- Header
- Hero
- Product card

### Phase 3
- Category section
- Service strip
- Footer

### Phase 4
- Mobile optimization
- Animations
- Performance

---

# Final Advice

Do **not** copy the original website's branding, logo, text, or images. Copy the **design system**:

- color palette,
- spacing rhythm,
- typography hierarchy,
- card structure,
- radius scale,
- shadow scale,
- and interaction patterns.

That design system is what creates the professional visual appearance.
