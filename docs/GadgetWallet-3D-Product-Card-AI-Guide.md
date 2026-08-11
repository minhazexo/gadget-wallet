
# GadgetWallet 3D Product Card Hover Effect - Complete AI Implementation Guide

This single Markdown file contains everything needed to implement the provided HTML/CSS/JS hover effect into a React + Vite ecommerce project such as GadgetWallet. You can give this file directly to an AI assistant (ChatGPT, Claude, Gemini, Copilot) and ask it to generate the production-ready code.

---

## Project Goal

Add a premium **3D hover animation** to every product card in your ecommerce website with:

- 3D lift on hover
- Floating product image
- Animated circle behind product
- Sliding product title
- Sliding action buttons
- Dark/Light mode support
- Responsive layout
- Reusable React component
- Add to Cart and Buy Now actions
- GadgetWallet teal + bronze branding

---

# 1. Original Effect Source

The effect you provided is based on:

- HTML card structure
- CSS 3D transforms
- JavaScript theme toggle

Save your original source separately for reference.

Recommended file:

```text
docs/original-hover-effect.txt
```

---

# 2. Folder Structure

Create these files in your React + Vite project:

```text
src/
├── components/
│   ├── ProductCard3D.jsx
│   ├── ProductCard3D.css
│   ├── ProductsGrid.jsx
│   └── ThemeToggle.jsx
├── styles/
│   └── theme.css
├── pages/
│   └── ProductsPage.jsx
└── main.jsx
```

---

# 3. Exact AI Prompt (Use This)

Copy everything below and send it to ChatGPT/Claude/Gemini:

```text
You are a senior React ecommerce UI engineer.

I have an ecommerce website called GadgetWallet built with React + Vite.

Convert my provided HTML/CSS/JS 3D hover card effect into a production-ready reusable React component.

Requirements:
- Create ProductCard3D.jsx and ProductCard3D.css
- Use React functional components
- Accept props: product, onAddToCart, onBuyNow
- Keep the original 3D hover animation exactly
- Use CSS variables for dark/light mode
- Make it fully responsive
- Add Add to Cart and Buy Now buttons
- Keep the floating image effect
- Keep the animated circle background
- Keep the title slide-in effect
- Keep the button slide-up effect
- Use GadgetWallet colors:
  teal #0ea5a4
  bronze #b08d57
  dark background #111827
  light background #ffffff
- Add subtle premium glow on hover
- Add accessibility improvements
- Optimize performance with transform and opacity only
- Use translate3d and will-change
- Include full code for:
  1. ProductCard3D.jsx
  2. ProductCard3D.css
  3. ProductsGrid.jsx
  4. ThemeToggle.jsx
  5. theme.css
  6. ProductsPage.jsx
  7. main.jsx import example
- Include exact import statements
- Do not redesign the effect; preserve the original transform behavior.
```

---

# 4. Theme Variables

Create `src/styles/theme.css` and ask AI to include:

```css
:root {
  --main-bg: #111827;
  --box-bg: #1f2937;
  --name-color: #f8fafc;
  --card-bg-text: #ffffff;
  --primary: #0ea5a4;
  --accent: #b08d57;
}

.light {
  --main-bg: #ffffff;
  --box-bg: #f8fafc;
  --name-color: #111827;
  --card-bg-text: #111827;
}
```

Import this file in `main.jsx`.

---

# 5. Expected React Card Structure

Tell AI to generate a component similar to:

```jsx
<div className={`product3d-card ${product.accentColor}`}>
  <h2 className="product3d-name">{product.title}</h2>

  <div className="product3d-circle"></div>

  <img
    src={product.image}
    alt={product.title}
    className="product3d-image"
  />

  <div className="product3d-info">
    <p className="product3d-category">{product.category}</p>
    <p className="product3d-price">৳{product.price}</p>
  </div>

  <div className="product3d-actions">
    <button onClick={() => onAddToCart(product)}>
      Add to Cart
    </button>

    <button onClick={() => onBuyNow(product)}>
      Buy Now
    </button>
  </div>
</div>
```

---

# 6. Required CSS Adaptations

Ask AI to change the original fixed dimensions to responsive dimensions:

```css
.product3d-card {
  width: 100%;
  max-width: 320px;
  height: 420px;
}
```

Responsive image:

```css
.product3d-image {
  width: 85%;
  height: auto;
  object-fit: contain;
}
```

Mobile support:

```css
@media (max-width: 768px) {
  .product3d-card {
    max-width: 100%;
    height: 380px;
  }
}
```

---

# 7. Products Grid Example

Ask AI to create:

```jsx
const products = [
  {
    id: 1,
    title: "Wireless Earbuds",
    price: 1999,
    category: "Earbuds",
    image: "/product-images/earbuds/1.webp",
    accentColor: "blue"
  },
  {
    id: 2,
    title: "Fast Charger",
    price: 899,
    category: "Charger",
    image: "/product-images/charger/1.webp",
    accentColor: "green"
  }
];

<div className="products-grid">
  {products.map(product => (
    <ProductCard3D
      key={product.id}
      product={product}
      onAddToCart={handleAddToCart}
      onBuyNow={handleBuyNow}
    />
  ))}
</div>
```

Grid CSS:

```css
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  justify-items: center;
}
```

---

# 8. Dark / Light Mode Toggle

Ask AI:

```text
Create a React ThemeToggle component that toggles the class "light" on document.documentElement and stores the preference in localStorage.
```

Expected behavior:

- Click button
- Add/remove `.light`
- Save theme in localStorage
- Load saved theme on refresh

---

# 9. Performance Optimization Prompt

Give AI this instruction:

```text
Optimize the card animation for performance:
- animate only transform and opacity
- add will-change: transform
- use translate3d
- avoid layout thrashing
- avoid animating width/height/top/left
```

---

# 10. Accessibility Prompt

Give AI this instruction:

```text
Add accessibility improvements:
- meaningful alt text
- keyboard focus styles
- aria-labels for buttons
- visible focus ring
- sufficient color contrast
```

---

# 11. Premium Glow Prompt

Ask AI:

```text
Add a subtle premium glow around the card on hover using box-shadow and a pseudo-element, suitable for a modern electronics ecommerce website.
```

---

# 12. Loading Skeleton Prompt

Ask AI:

```text
Create ProductCardSkeleton component with the same dimensions and a shimmer loading animation.
```

---

# 13. How to Integrate Into GadgetWallet

## Step 1

Create all files listed above.

## Step 2

Paste AI-generated code into the files.

## Step 3

Import grid component in your products page:

```jsx
import ProductsGrid from "../components/ProductsGrid";
```

## Step 4

Render:

```jsx
<ProductsGrid />
```

## Step 5

Start the dev server:

```bash
bun run dev
```

or

```bash
npm run dev
```

---

# 14. Replace Demo Data With Database Products

If products come from Neon DB or API:

```jsx
const { data: products } = useProducts();
```

Pass real product objects to `ProductCard3D`.

---

# 15. Image Recommendations

Use:

- WebP format
- 600×600 px
- Transparent background if possible
- Compressed images (<150 KB)

---

# 16. Common Problems and AI Fix Prompts

## Hover effect disappears

```text
Preserve the original transform, translate3d, rotate, opacity, and transition values exactly from the source code.
```

## Image jumps

```text
Keep the image centered with transform: translate(-50%, -50%) and animate only translate3d.
```

## Buttons overlap

```text
Use flex column layout for actions and reserve bottom spacing inside the card.
```

## Dark mode not working

```text
Ensure theme variables are defined in :root and overridden in .light, and import theme.css in main.jsx.
```

---

# 17. Testing Checklist

After implementation verify:

- [ ] Card lifts on hover
- [ ] Image floats upward
- [ ] Circle moves forward
- [ ] Title fades/slides in
- [ ] Buttons slide upward
- [ ] Add to Cart works
- [ ] Buy Now works
- [ ] Mobile layout works
- [ ] Dark mode works
- [ ] Keyboard navigation works
- [ ] No console errors
- [ ] Lighthouse performance is acceptable

---

# 18. Production Checklist

Before deployment:

- [ ] Minify CSS
- [ ] Lazy-load product images
- [ ] Use responsive image sizes
- [ ] Remove unused CSS
- [ ] Test Chrome, Edge, Firefox, Android, iPhone
- [ ] Check Vercel production build

---

# 19. Final One-Line Prompt

If you want the AI to do everything automatically, send only this:

```text
Implement my provided 3D hover card effect into a production-ready React + Vite ecommerce component system for GadgetWallet, including ProductCard3D.jsx, ProductCard3D.css, ProductsGrid.jsx, ThemeToggle.jsx, theme.css, responsive layout, dark mode, Add to Cart, Buy Now, accessibility, performance optimization, and teal/bronze branding while preserving the original animation behavior exactly.
```

---

# 20. Expected Result

You will get a reusable **premium 3D product card component** that works with your GadgetWallet ecommerce system and looks similar to modern high-end electronics stores, fully integrated with React, Vite, dark mode, and your product database.

---

# 21. GadgetWallet Implementation Notes (already applied)

This guide was written for a plain React + Vite layout, but GadgetWallet is a
TypeScript monorepo. The 3D effect has been implemented natively. Do not
re-create the files below as `.jsx` — the real equivalents already exist:

| Guide file | Real location in GadgetWallet |
| --- | --- |
| `src/components/ProductCard3D.jsx` | `client/src/components/ProductCard.tsx` (markup + commerce logic) |
| `src/components/ProductCard3D.css` | `client/src/styles/product-card-3d.css` (dedicated 3D CSS file, imported by `ProductCard.tsx`) |
| VanillaTilt `script.js` | `client/src/components/useProductCard3D.ts` (dedicated JS/TS module — framer-motion springs, same feel, no dependency) |
| `src/components/ProductsGrid.jsx` | Grids in `client/src/pages/Shop.tsx`, `Home.tsx`, `SearchResults.tsx` (they all render `<ProductCard/>`) |
| `src/components/ThemeToggle.jsx` + `src/styles/theme.css` | Not needed — dark mode already exists via the `.dark` class (Tailwind `darkMode: "class"`) |
| `src/pages/ProductsPage.jsx` | `client/src/pages/Shop.tsx` (real products from the Neon DB via `api-handlers`) |

## Branding (teal/bronze → red)

The guide proposes teal `#0ea5a4` + bronze `#b08d57`. GadgetWallet's actual
brand is red (`gw-red` `#e11d2e`, hover `#c1121f`, primary `#E60023`). The
implementation uses the red palette:

- Glow shadow: `0 24px 48px rgba(225, 29, 46, 0.16)`
- Animated circle: radial gradient of `rgba(225, 29, 46, …)`
- Buy Now button: `bg-gw-red` → `hover:bg-gw-red-hover`

## What was implemented (final architecture)

The original effect's mechanics are preserved exactly — a perspective wrapper,
`preserve-3d` chain, and `translateZ` depth layers:

- DOM: `.gw-product-card-3d-wrap` (CSS `perspective: 900px` property) →
  card anchor (`.gw-product-card`, `preserve-3d`, framer tilt) →
  `.gw-product-card-3d-stage` (square, `preserve-3d`) → layers.
- Depth pops on hover: circle `translateZ 0 → 35px`, image
  `0 → 100px` (+`rotate(-6deg)`, centered with `translate3d(-50%,-50%,Z)`);
  title / rating+price / buttons float at `115px` and slide into place.
- Tilt: `useProductCard3D.ts` — `useSpring`-based `rotateX/rotateY` toward the
  cursor (max 12°) + `scale 1.05`, exactly the VanillaTilt config
  (`max:15, scale:1.05`), without the library.
- Critical: the `perspective` PROPERTY is on the wrapper, NOT a
  `perspective()` transform on the card — framer-motion 11.x ignores
  `transformPerspective` in style transforms, which silently killed the depth
  in earlier attempts.
- Nothing between wrapper and layers clips or flattens 3D: `.gw-product-card`
  has no `overflow-hidden` (it is `block` + rounded + bordered only).
- Animation is transform/opacity only, `will-change: transform` on moving
  layers, `cubic-bezier(0.22, 1, 0.36, 1)` easing.
- Accessibility: `aria-label` on both buttons, visible `focus-visible` ring on
  the card link, `useReducedMotion()` disables the tilt, and a
  `prefers-reduced-motion: reduce` CSS block keeps everything static and
  readable.
- Hover-capable devices: title/price/actions hidden at rest and revealed by
  sliding in. Touch devices (`@media (hover: hover) and (pointer: fine)` gate
  inverted) and reduced-motion users get a static, always-visible layout.
- The card now has **Add to Cart** + **Buy Now** (Buy Now = `addItem()` then
  navigate to `/checkout`). Both require login and stop click bubbling so the
  card link is not followed.
- `Shop.tsx` grid view was refactored to render the shared `<ProductCard/>`
  (removing its duplicate inline card); the list (row) view keeps
  `gw-product-card-row` untouched.
- Loading skeletons already exist (`packages/ui/src/skeleton.tsx`, used by
  Shop/Home) and products come straight from the database, so guide steps
  §12–§14 are already satisfied.
- Cards stay white in both light and dark themes (product photos need a light
  tile); the page background adapts via the existing `.dark` variables.
- Verify against the §17 checklist in the running app:
  `npm run dev` (repo root) or `npm run dev` inside `client/`.
