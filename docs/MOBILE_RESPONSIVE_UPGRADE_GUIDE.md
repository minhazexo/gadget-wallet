# Gadget Wallet — Professional Mobile & Responsive Upgrade Guide

Deep-dive audit of the whole storefront (client + `packages/ui`) focused on making
the experience feel **native, premium and professional on phones, tablets and
every device in between** — including what to do with the desktop-only **3D
product-card effect** on touch screens.

> **Why this matters:** on mobile there is no hover, no precise cursor, a much
> smaller viewport, and a thumb instead of a mouse. Everything that works on
> desktop — the 3D tilt, hover-lift cards, inline nav — either does nothing or
> feels wrong on a phone. This guide covers the *current* state, the gaps, and
> concrete, prioritized fixes with code.
>
> Current stack: React 18 + Vite + Tailwind (custom `gw-*` layer) +
> framer-motion + `@gadget-wallet/ui` shared package. Breakpoints in use:
> `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280.

---

## Priority summary

| # | Area | Impact | Effort | Tier |
|---|------|--------|--------|------|
| 1 | Viewport meta + safe-area insets (notch/home-indicator) | High | Low | T1 |
| 2 | Touch-optimized product cards (replace desktop 3D) | High | Low–Med | T1 |
| 3 | Touch targets ≥ 44 px on all key CTAs | High | Low | T1 |
| 4 | Sticky bottom action bar on Product Details (mobile) | High | Low | T1 |
| 5 | Navbar: collapse on scroll, taller tap areas, no stuck hovers | High | Med | T1 |
| 6 | `active:`/`whileTap` states everywhere (no hover-only feedback) | Medium | Low | T1 |
| 7 | Forms: `autoComplete`/`inputMode`, no iOS zoom-out | Medium | Low | T1 |
| 8 | Dark mode: `prefers-color-scheme` + no flash of wrong theme | Medium | Low | T1 |
| 9 | Toast / scroll-to-top: safe-area + max-width on small screens | Medium | Low | T1 |
| 10 | Bottom tab bar (native-app navigation) | High | Med | T2 |
| 11 | Swipeable gallery + scroll-snap strips | Medium | Low–Med | T2 |
| 12 | Filter drawer → bottom sheet on mobile (Shop) | Medium | Med | T2 |
| 13 | Overscroll/scroll-chaining + global reduced-motion policy | Medium | Low | T2 |
| 14 | Mobile skeletons + `content-visibility` for below-fold sections | Medium | Low | T2 |
| 15 | Admin tables → card view on small screens | Low–Med | Med | T3 |
| 16 | PWA install + offline shell (ties into perf doc #12) | Low | Med | T3 |

---

## 1. Viewport, status bar & safe areas — T1

**Current state (`client/index.html`):**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#1a3a4a" />
```

**Problems**
- No `viewport-fit=cover` → on notched iPhones the fixed bottom-right
  "scroll to top" button and any bottom-fixed element sit on top of the home
  indicator / safe area.
- `theme-color: #1a3a4a` is a dark navy — the header is white, so the browser
  status bar visibly clashes and looks unprofessional.
- No `apple-mobile-web-app-capable` / `mobile-web-app-capable` meta for
  standalone installs (pair with the PWA item in the perf doc).

**Fix**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

**Safe-area utilities** — add to `client/tailwind.config.cjs` and/or `index.css`:
```css
/* index.css — reusable safe-area helpers */
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pt-safe { padding-top: env(safe-area-inset-top); }
.pl-safe { padding-left: env(safe-area-inset-left); }
.pr-safe { padding-right: env(safe-area-inset-right); }
.bottom-safe { bottom: calc(env(safe-area-inset-bottom) + 0.75rem); }
```
Apply `bottom-safe` to `ScrollToTop` (`packages/ui/src/scroll-to-top.tsx`, it is
`fixed bottom-6 right-6`) and to any future bottom bar / sticky CTA.

---

## 2. The 3D product card on touch — T1 (your specific concern)

**Current state**

- `client/src/components/useProductCard3D.ts` — tilt is driven by
  `onMouseMove`/`onMouseLeave` with framer-motion springs. Touch devices never
  fire `mouseleave`, so once a tap happens the card can stay tilted/lifted.
- `client/src/styles/product-card-3d.css`:
  - `perspective: 900px` on `.gw-product-card-3d-wrap` is **always on**.
  - The discount badge has `transform: translateZ(120px)` **permanently**, so
    even without hover the badge renders ~13 % larger/fuzzier on every device
    including mobile.
  - `will-change: transform` is always set on tilt/circle/image → wasted GPU
    layers on phones.
  - The only touch-related handling is `prefers-reduced-motion: reduce`, which
    is *not* a touch detector.
- `ProductCard.tsx` CTA buttons are `h-9` (36 px) with `text-[11px]` — below the
  44 px comfortable touch target.

**What "the 3D feel" should become on mobile** (recommendation — do NOT try to
replicate tilt with touch):

1. **Gate the 3D system to devices that can hover:**
```css
/* product-card-3d.css — add at the end */
@media (hover: none), (pointer: coarse) {
  .gw-product-card-3d-wrap { perspective: none; }
  .gw-product-card-3d-badge,
  .gw-product-card-3d-circle,
  .gw-product-card-3d-image {
    transform: none !important; /* kill permanent translateZ pops */
    transition: none;
    will-change: auto;
  }
  .gw-product-card-3d-tilt { will-change: auto; }
}
```
Also gate the JS side (`useProductCard3D.ts`):
```ts
import { useMediaQuery } from "usehooks-ts"; // or a tiny matchMedia helper
const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
if (reduceMotion || !canHover) return {}; // static card on touch
```

2. **Give touch users their own premium feel instead:**
   - **Press feedback** on the whole card: `whileTap={{ scale: 0.97 }}` on the
     card anchor + a quick 150 ms shadow/gloss flash.
   - **Image zoom-in on tap** (before navigation): e.g. the product image scales
     1.06 with a soft gradient sheen sweeping across — feels deliberate, not broken.
   - **Quick-add affordance**: on coarse pointers show the "Add to Cart / Buy
     Now" buttons always (they already are) but enlarge them to 44 px (see #3).
   - Optionally an **explicit "3D view" toggle on the Product Details page**
     using the `DeviceOrientation` API behind a user gesture — gimmicky and
     battery-heavy, so treat as a stretch goal, not a requirement.

3. **Hook the hook to viewport lazily** (perf doc #6 follow-up): only run the 3D
   hook on cards inside the viewport, or only when `pointer: fine` — this also
   helps tablets that report coarse pointers.

---

## 3. Touch targets ≥ 44 px — T1

Apple's HIG / Material both target **44–48 px** minimum. Current offenders:

| Control | File | Current | Fix |
|---|---|---|---|
| Product card CTA buttons | `ProductCard.tsx` (`.gw-product-card-3d-cta`) | `height: 36px; font-size: 11px` | `height: 44px` (+ `text-xs`), keep 2-col grid legible |
| Gallery thumbnails | `ProductDetails.tsx` (w-14 h-14 = 56 px) | OK on mobile | keep, add `active:scale-95` |
| Quantity stepper ± | `Cart.tsx`, `ProductDetails.tsx` | `p-1.5` (≈ 28 px) | min 40–44 px (`p-2.5` + `min-w-[40px]`) |
| Remove-from-cart / wishlist heart | `Cart.tsx`, `Wishlist.tsx` | `w-8 h-8` (32 px) | 40–44 px or add invisible padding |
| Navbar mobile burger / cart | `navbar.css` | burger `p-2`, cart `p-1` | ≥ 44 px hit area (`::after` inset trick) |
| Wishlist/Recently-viewed "Cart"/"Buy" | profile sections | `h-9` (36 px) | `h-10`–`h-11` |

**Global safety net** in `index.css` (base layer):
```css
@layer base {
  button, a, [role="button"], input, select, textarea { touch-action: manipulation; }
  a, button { -webkit-tap-highlight-color: transparent; }
}
```
`touch-action: manipulation` removes the 300 ms tap delay on older browsers and
double-tap-zoom interference on fast taps.

---

## 4. Sticky bottom action bar on Product Details — T1

**Current state:** `ProductDetails.tsx` renders Add to Cart / Buy Now inline in
the right column; on mobile the user must scroll back up through the whole
description to reach the CTA again. Professional commerce apps pin the actions.

**Fix:** render a fixed bottom bar **only below `lg`** (desktop keeps the inline
buttons):
```tsx
{/* after the main grid, inside the page component */}
<div className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-gw-border bg-white/95 backdrop-blur px-4 pt-3 pb-safe shadow-gw-lg">
  <div className="flex gap-3">
    <Button variant="dark" className="flex-1 h-12" onClick={handleAddToCart}>Add to Cart</Button>
    <Button variant="primary" className="flex-1 h-12" onClick={handleBuyNow}>Buy Now</Button>
  </div>
</div>
```
- Use the `pb-safe` class from #1 so it clears the home indicator.
- Add `pb-24` to the page's `<Container>` on mobile so the last content isn't
  hidden behind the bar.
- Add `pb-16` to the page container — same pattern works for **Cart** and
  **Checkout** summary on mobile if you want a persistent total bar.

---

## 5. Navbar — collapse on scroll, fix stuck hovers, bigger taps — T1

**Current state (`packages/ui/src/navbar.tsx` + `navbar.css`)**
- Mobile row is `height: 5rem` plus a **separate always-visible search row**
  (`.gw-nav-msearch`) → the sticky header can occupy ~25 % of a phone screen.
- `navLinks`/underline use `whileHover` — hover styles persist after a tap.
- Account dropdown opens on `onMouseEnter` — unreachable by touch (mobile users
  rely on the drawer links instead, which is fine, but the desktop hover menu
  shouldn't be the only path on tablets).

**Recommendations**
1. **Compress on scroll:** add an `isScrolled` variant (already exists in the
   navbar) that hides the mobile search row and shrinks the logo once the user
   scrolls down (`max-height`/`opacity` transition). Storefront keeps its
   prominent search on load, then gets out of the way.
2. **Full-height drawer:** replace the current accordion-style drawer
   (`height: auto` animation) with a proper slide-down/right panel that covers
   the viewport (`fixed inset-0 z-50 overflow-y-auto`) — more native, easier to
   scroll with many links, and it closes reliably.
3. **Prevent stuck hover:** for anything animated with `whileHover`, also add
   `whileTap` (see #6) and wrap the mobile paths in the same `hover: none`
   media gate.
4. **Search UX:** consider moving the search *into* the drawer on mobile, or
   making it a tap-to-expand bar, instead of a permanent second row.

---

## 6. `active:`/`whileTap` states everywhere — T1

**Audit result:** many interactions only define `whileHover` (e.g. cards on
Home/Categories/Wishlist, `whileHover={{ y: -3 }}` stat cards in Overview, icon
buttons in ProductDetails). On touch, hover never resolves → **zero feedback**
when the user presses.

**Rule:** every interactive element needs a press state. Add `whileTap` or
Tailwind `active:` to:
- `Home.tsx` category/brand/featured cards (they have `whileHover` only).
- `Wishlist.tsx` cards, `OverviewSection.tsx` stat buttons.
- Icon buttons in `ProductDetails.tsx` (wishlist/share/steppers).
- All `<Button>` usages already get `whileTap` at the wrapper in most places —
  standardize by adding `active:scale-[0.97]` to the shared `Button` base styles
  so every button gets press feedback for free.

---

## 7. Forms: mobile keyboards & the iOS zoom bug — T1

**Current state:** `packages/ui/src/input.tsx` renders `<input className="... text-gw-black ...">`
without `autoComplete` or `inputMode`; the navbar search input is `font-size: 0.875rem`.

**Problems**
- **iOS Safari auto-zooms into any input whose font-size < 16 px.** The navbar
  search input (`navbar.css`, `font-size: 0.875rem`) triggers this. Fix:
  `font-size: 16px` on mobile inputs (or `transform: scale()` hack — prefer 16 px).
- No `autoComplete` hints → the phone keyboard offers no autofill for email,
  name, password, address fields (Checkout has 6 address inputs that should
  autofill from the system).
- No `inputMode` → number fields (price filters, ZIP, phone, quantity) show the
  full QWERTY instead of the numeric keypad.

**Fix in `Input`/`gw-form-input` and call sites**
```tsx
<Input label="Email" type="email" autoComplete="email" inputMode="email" />
<Input label="Phone" type="tel" autoComplete="tel" inputMode="tel" />
<Input label="ZIP Code" autoComplete="postal-code" inputMode="numeric" />
```
- Checkout `addressFields` (`Checkout.tsx`): add `autoComplete` per field
  (`street-address`, `address-level2`, `postal-code`, `country-name`, …).
- Global: ensure every text input is `text-base` (16 px) on mobile; only scale
  down at `md:` and above (`md:text-sm`).

---

## 8. Dark mode without flash — T1

**Current state:** `Profile.tsx` toggles `.dark` on `<html>` and persists to
`localStorage` — but the class is applied only *after* React mounts, and there's
no `prefers-color-scheme` initial read.

**Problems:** first paint is always light (flash); new users get no system-based
default; there is no dark favicon/status-bar coordination.

**Fix — tiny init script before the app mounts** (`client/index.html`):
```html
<script>
  (function () {
    var stored = localStorage.getItem("gw-dark");
    var dark = stored === "1" || (stored === null && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  })();
</script>
```
Then in `Profile.tsx` keep the toggle as-is (it already syncs `localStorage` +
class). Optionally listen to `matchMedia("(prefers-color-scheme: dark)")` changes
when the user hasn't explicitly chosen.

---

## 9. Toast & scroll-to-top polish — T1

**Current state**
- `toast.tsx`: `fixed top-4 left-1/2 -translate-x-1/2` — on small screens it can
  sit under the sticky navbar and has no max-width (long messages span the
  whole width edge-to-edge).
- `scroll-to-top.tsx`: `bottom-6 right-6` — collides with the iOS home indicator
  (fix with `bottom-safe` from #1) and overlaps the sticky Product Details CTA
  bar from #4 (give the button `z-40` and offset it above the bar, or hide it
  when the bar is visible).

**Fix**
```tsx
{/* toast */}
className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md
           flex items-center gap-3 px-5 py-3 bg-white border border-gw-border rounded-xl shadow-gw-md"
```
- Move toasts below the sticky header (`top-20`) so they never overlap the nav.
- On the Product Details page, `bottom-24` the scroll-to-top button so it clears
  the sticky CTA bar.

---

## 10. Bottom tab bar (native-app navigation) — T2

**The single biggest "professional mobile app" upgrade.** Storefront users on
phones expect persistent navigation: **Home · Shop · Cart · Wishlist · Account**.

**Recommended implementation** (in `App.tsx` next to `<Footer>`):
```tsx
// only < lg
const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shop", label: "Shop", icon: Search },
  { to: "/cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
  { to: "/wishlist", label: "Wishlist", icon: Heart, badge: wishlistCount },
  { to: "/profile", label: "Account", icon: User },
];
```
- `fixed inset-x-0 bottom-0 z-40 lg:hidden bg-white border-t pb-safe` with 5
  equal 44 px-tall buttons, active state = `text-gw-red` + small indicator dot.
- Add `pb-16 lg:pb-0` on `<main>` so page content isn't hidden behind the bar.
- Hide it on `/checkout` and `/order-success` (focus states) — conditional on
  `location.pathname`.
- This also lets you remove the cart icon from the mobile header row (#5),
  freeing vertical space.

---

## 11. Swipeable gallery + scroll-snap strips — T2

**Current state:** ProductDetails main image is a single `<img>` with thumbnail
buttons; horizontal strips (gallery thumbs, RecentlyViewed, Reviews) scroll
freely without snap.

**Fix**
- Main gallery on mobile: make the image container `overflow-x-auto snap-x
  snap-mandatory flex` with one slide per image — swipe gestures between photos
  (desktop keeps the click-to-select thumbnails). Update `selectedImage` on
  `onScroll` end or use a lightweight `useRef` + scroll index.
- Horizontal strips: add `snap-x snap-mandatory` + `snap-start` on children so
  cards settle neatly instead of stopping mid-card. Add `scrollbar-width: none`
  (already present in most strips).
- Bonus: `overscroll-behavior-x: contain` on those strips so a sideways swipe
  doesn't navigate the browser back (`index.css`:
  `.overflow-x-auto { overscroll-behavior-x: contain; }`).

---

## 12. Shop filters → bottom sheet on mobile — T2

**Current state:** `Shop.tsx` toggles an inline expanding panel
(`AnimatePresence` + `height: auto`) under the toolbar. On small screens the
filter form is long (sort + 6 groups) and pushes the product grid far down.

**Fix:** render the mobile filter panel as a **bottom sheet**
(`fixed inset-0 z-50` backdrop + panel sliding up from the bottom, capped at
`max-h-[85vh] overflow-y-auto`, with a grabber handle and "Show N results"
button). Desktop `lg:` sidebar is unchanged. All filter state lives in the same
`filters` object, so this is purely a layout swap.

---

## 13. Overscroll, scroll-chaining & global reduced motion — T2

- `body { overflow-x: hidden; }` currently *masks* horizontal overflow rather
  than fixing it — keep it, but also add
  `overscroll-behavior-y: none` on the body so pull-to-refresh doesn't fight the
  sticky header, and `overscroll-behavior: contain` on modals/drawers
  (`shared.tsx` Modal, admin menus).
- **Global reduced-motion policy:** today only the 3D card and
  `useProductCard3D` respect `prefers-reduced-motion`. Add to `index.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
  This instantly makes the whole app calmer for users with motion sensitivity
  (and cheaper on low-end phones).
- `App.tsx` uses `window.scrollTo({ top: 0, behavior: "smooth" })` on route
  change — switch to instant (`"auto"`) so page changes feel snappy, keep smooth
  only for in-page anchors.

---

## 14. Skeletons + `content-visibility` — T2

- Pages with skeletons today: Shop, SearchResults. Home sections render nothing
  while loading (blank grid), ProductDetails shows "Loading...", Cart shows a
  text pulse. Add the existing `Skeleton`-style pulse blocks (reuse the Shop
  skeleton markup) to Home's 5 sections and ProductDetails for a professional
  feel.
- Low-effort render win — mark below-fold sections (Home service strip, reviews,
  newsletter) with:
```css
.gw-below-fold { content-visibility: auto; contain-intrinsic-size: 480px; }
```
  applied only on mobile where the payoff is biggest.

---

## 15. Admin on mobile — T3 (nice-to-have)

- Admin tables (`AdminProducts.tsx`, `AdminOrders.tsx`, `AdminBrands`,
  `AdminCategories`) already wrap in `overflow-x-auto` — usable but cramped.
  Optional: below `md`, render each row as a **card** (image + name + price +
  stacked badges + action icons) instead of a table. Low priority — admin is a
  desktop tool — but worth noting since the dashboard is reachable from phones.

---

## 16. PWA & install — T3 (see also perf doc #12)

- `manifest.json` exists but there's no service worker; `theme-color` and
  start-url are fine. Adding `vite-plugin-pwa` gives install prompts, an
  offline shell, and makes the app feel native when added to the home screen.
- Combine with #1's `mobile-web-app-capable`/apple metas.

---

## Suggested implementation order

**Tier 1 (one sprint, high polish per line of code):**
1. #1 viewport + theme-color + safe-area utilities (5 min, fixes status bar + home indicator).
2. #2 touch media-query gating of the 3D card + press feedback (kills the stuck-tilt/big-badge issues).
3. #3 touch targets + `touch-action` + tap-highlight globals.
4. #6 press states (`whileTap`/`active:`) on hover-only cards.
5. #4 sticky mobile CTA bar on ProductDetails.
6. #7 form `autoComplete`/`inputMode` + 16 px inputs.
7. #8 dark-mode init script.
8. #9 toast/scroll-to-top safe-area + positioning.

**Tier 2 (next):** #10 bottom tab bar → #11 swipeable gallery + snap → #12 filter
bottom sheet → #13 overscroll + global reduced-motion → #14 skeletons.

**Tier 3 (later):** #15 admin card views, #16 PWA.

After each step, verify with a real device / Chrome DevTools device emulation
(iPhone SE 375 px, iPhone 14 Pro 390 px, iPad 768/1024 px, Android 360 px) —
check the three hard rules: **nothing is hidden behind the notch/home indicator,
every tappable thing is ≥ 44 px, and no layout horizontal-scrolls.**

---

## Appendix A — quick code snippets cheat sheet

```css
/* index.css additions (base layer) */
button, a, [role="button"], input, select, textarea { touch-action: manipulation; }
a, button { -webkit-tap-highlight-color: transparent; }
body { overscroll-behavior-y: none; }
.overflow-x-auto { overscroll-behavior-x: contain; }

.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pt-safe { padding-top: env(safe-area-inset-top); }
.pl-safe { padding-left: env(safe-area-inset-left); }
.pr-safe { padding-right: env(safe-area-inset-right); }
.bottom-safe { bottom: calc(env(safe-area-inset-bottom) + 0.75rem); }

/* product-card-3d.css — touch gate (append) */
@media (hover: none), (pointer: coarse) {
  .gw-product-card-3d-wrap { perspective: none; }
  .gw-product-card-3d-badge,
  .gw-product-card-3d-circle,
  .gw-product-card-3d-image { transform: none !important; transition: none; will-change: auto; }
  .gw-product-card-3d-tilt { will-change: auto; }
}
```

```html
<!-- index.html head -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
<meta name="mobile-web-app-capable" content="yes" />
<script>
  (function () {
    var stored = localStorage.getItem("gw-dark");
    var dark = stored === "1" || (stored === null && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  })();
</script>
```

---

*Related docs: `docs/PERFORMANCE_OPTIMIZATION.md` (load speed — items 1–9, 11
implemented), `docs/GadgetWallet-3D-Product-Card-AI-Guide.md` (3D card
implementation), `docs/goribergadget_complete_visual_guide.md` (visual system).*
