import { db } from "./index.js";
import { users, categories, brands, products, productImages, productSpecs, heroMedia, banners, settings } from "./schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "products";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } }) : null;

const PLACEHOLDER_COLORS = ["#e11d2e", "#2563eb", "#16a34a", "#9333ea", "#f59e0b", "#0ea5e9", "#db2777", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];

/**
 * Generates a tiny SVG placeholder, uploads it to Supabase Storage under
 * products/{productId}/ and returns the storage path + public URL.
 * Returns null when Supabase is not configured (seed then uses picsum URLs).
 */
async function uploadPlaceholder(productId: string, title: string, index: number) {
  if (!supabase) return null;

  const fileName = `${Date.now()}-seed-${index}.svg`;
  const storagePath = `${BUCKET}/${productId}/${fileName}`;
  const color = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="${color}"/><circle cx="400" cy="330" r="150" fill="rgba(255,255,255,0.18)"/><text x="400" y="560" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="700" fill="#ffffff" text-anchor="middle">${title}</text><text x="400" y="620" font-family="Inter, Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.75)" text-anchor="middle">Gadget Wallet</text></svg>`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, svg, {
    contentType: "image/svg+xml",
    upsert: true,
  });
  if (error) throw new Error(`Failed to upload seed image for ${title}: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { path: storagePath, url: data.publicUrl };
}

async function seed() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  await db.insert(users).values({
    email: "admin@gadgetwallet.com",
    name: "Admin",
    passwordHash: adminPassword,
    role: "admin",
  });

  // Categories
  const cats = await db
    .insert(categories)
    .values([
      { name: "Smartphones", slug: "smartphones", description: "Latest smartphones from top brands" },
      { name: "Laptops", slug: "laptops", description: "High-performance laptops for work and play" },
      { name: "Smartwatches", slug: "smartwatches", description: "Smart watches for every lifestyle" },
      { name: "Headphones", slug: "headphones", description: "Premium audio experience" },
      { name: "Gaming", slug: "gaming", description: "Gaming accessories and gear" },
      { name: "Cameras", slug: "cameras", description: "Capture every moment" },
      { name: "Tablets", slug: "tablets", description: "Portable computing at your fingertips" },
      { name: "Accessories", slug: "accessories", description: "Essential gadgets and accessories" },
    ])
    .returning();

  // Brands
  const brds = await db
    .insert(brands)
    .values([
      { name: "Apple", slug: "apple", description: "Apple Inc." },
      { name: "Samsung", slug: "samsung", description: "Samsung Electronics" },
      { name: "Sony", slug: "sony", description: "Sony Corporation" },
      { name: "ASUS", slug: "asus", description: "ASUS Tek Computer" },
      { name: "Logitech", slug: "logitech", description: "Logitech International" },
      { name: "Dell", slug: "dell", description: "Dell Technologies" },
      { name: "Bose", slug: "bose", description: "Bose Corporation" },
      { name: "Canon", slug: "canon", description: "Canon Inc." },
    ])
    .returning();

  // Products - Smartphones
  const productsList = [
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      shortDescription: "The most powerful iPhone ever. A17 Pro chip, titanium design, and 48MP camera system.",
      fullDescription: "iPhone 15 Pro Max features a strong and lightweight titanium design, the A17 Pro chip with 6-core GPU, a 48MP Main camera with 3x or 5x Telephoto, and all-day battery life. It also features USB-C and is built for Apple Intelligence.",
      price: 1199.99,
      discountPrice: 1099.99,
      sku: "APL-IP15PM-256",
      brandId: brds[0].id,
      categoryId: cats[0].id,
      stock: 50,
      rating: 4.8,
      reviewCount: 1245,
      // Flagship items are Featured only — the New Arrivals section is reserved
      // for the genuinely new releases (ROG Zephyrus, Galaxy Watch 6, Bose QC
      // Ultra, Logitech Superlight) so the two homepage sets never overlap.
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      shortDescription: "Galaxy AI is here. The ultimate Galaxy experience with built-in AI and a Titanium frame.",
      fullDescription: "The Samsung Galaxy S24 Ultra is built with a titanium frame, Galaxy AI features, a 200MP camera, and the Snapdragon 8 Gen 3 processor. Includes the S Pen and a stunning Dynamic AMOLED 2X display.",
      price: 1299.99,
      discountPrice: 1149.99,
      sku: "SAM-GS24U-512",
      brandId: brds[1].id,
      categoryId: cats[0].id,
      stock: 45,
      rating: 4.7,
      reviewCount: 982,
      // Flagship item — Featured only, never New Arrivals.
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
    },
    // Laptops
    {
      name: "MacBook Pro 16 M3 Max",
      slug: "macbook-pro-16-m3-max",
      shortDescription: "Supercharged by M3 Max chip. Extreme performance for pros.",
      fullDescription: "The MacBook Pro 16-inch with M3 Max chip delivers groundbreaking performance with up to 16-core CPU and 40-core GPU. Features a stunning Liquid Retina XDR display, up to 22 hours of battery life, and advanced camera and audio.",
      price: 2499.99,
      sku: "APL-MBP16-M3X",
      brandId: brds[0].id,
      categoryId: cats[1].id,
      stock: 30,
      rating: 4.9,
      reviewCount: 756,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
    },
    {
      name: "ASUS ROG Zephyrus G16",
      slug: "asus-rog-zephyrus-g16",
      shortDescription: "Ultra-slim gaming laptop with Intel Core Ultra 9 and RTX 4070.",
      fullDescription: "The ASUS ROG Zephyrus G16 combines a slim design with desktop-level gaming performance. Features an Intel Core Ultra 9 processor, NVIDIA RTX 4070 GPU, 16-inch OLED display, and ROG Intelligent Cooling.",
      price: 1999.99,
      discountPrice: 1799.99,
      sku: "ASUS-ROG-G16",
      brandId: brds[3].id,
      categoryId: cats[1].id,
      stock: 25,
      rating: 4.6,
      reviewCount: 342,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
    },
    // Smartwatches
    {
      name: "Apple Watch Ultra 2",
      slug: "apple-watch-ultra-2",
      shortDescription: "The most rugged and capable Apple Watch ever. Built for endurance.",
      fullDescription: "Apple Watch Ultra 2 features a precision dual-frequency GPS, 3000-nit display, Action button, and the S9 SiP chip. Designed for extreme environments with a titanium case and water resistance to 100m.",
      price: 799.99,
      sku: "APL-AWU2-49",
      brandId: brds[0].id,
      categoryId: cats[2].id,
      stock: 40,
      rating: 4.7,
      reviewCount: 523,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
    },
    {
      name: "Samsung Galaxy Watch 6 Classic",
      slug: "samsung-galaxy-watch-6-classic",
      shortDescription: "Classic design meets modern health tracking with rotating bezel.",
      fullDescription: "The Galaxy Watch 6 Classic brings back the iconic rotating bezel. Track your sleep, body composition, and heart health. Powered by Wear OS and One UI Watch.",
      price: 399.99,
      discountPrice: 329.99,
      sku: "SAM-GW6C-47",
      brandId: brds[1].id,
      categoryId: cats[2].id,
      stock: 60,
      rating: 4.5,
      reviewCount: 678,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
    },
    // Headphones
    {
      name: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      shortDescription: "Industry-leading noise cancellation with crystal-clear hands-free calling.",
      fullDescription: "Sony WH-1000XM5 headphones feature industry-leading noise cancellation, exceptional sound quality, and 30-hour battery life. With Auto NC Optimizer, speak-to-chat, and multipoint connection.",
      price: 349.99,
      sku: "SONY-WH1000XM5",
      brandId: brds[2].id,
      categoryId: cats[3].id,
      stock: 80,
      rating: 4.8,
      reviewCount: 2341,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
    },
    {
      name: "Bose QuietComfort Ultra",
      slug: "bose-quietcomfort-ultra",
      shortDescription: "Immersive spatial audio with world-class noise cancellation.",
      fullDescription: "Bose QuietComfort Ultra headphones deliver spatial audio, CustomTune technology that calibrates sound to your ear, and legendary noise cancellation. Up to 24 hours of battery life.",
      price: 429.99,
      discountPrice: 379.99,
      sku: "BOSE-QCU-ULTRA",
      brandId: brds[6].id,
      categoryId: cats[3].id,
      stock: 55,
      rating: 4.7,
      reviewCount: 892,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
    },
    // Gaming
    {
      name: "Logitech G Pro X Superlight 2",
      slug: "logitech-g-pro-x-superlight-2",
      shortDescription: "The lightest and fastest PRO mouse. Under 60g with LIGHTFORCE switches.",
      fullDescription: "The Logitech G Pro X Superlight 2 is the lightest PRO mouse at under 60 grams. Features LIGHTFORCE hybrid switches, HERO 2 sensor with 44,000 DPI, and LIGHTSPEED wireless.",
      price: 159.99,
      sku: "LOG-GPX-SL2",
      brandId: brds[4].id,
      categoryId: cats[4].id,
      stock: 100,
      rating: 4.6,
      reviewCount: 1456,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
    },
    // Cameras
    {
      name: "Sony A7 IV",
      slug: "sony-a7-iv",
      shortDescription: "Full-frame hybrid camera with 33MP sensor and 4K 60p video.",
      fullDescription: "The Sony A7 IV combines a 33MP Exmor R CMOS sensor with the BIONZ XR processing engine. Features real-time Eye AF, 4K 60p video with 10-bit 4:2:2, and a vari-angle touchscreen.",
      price: 2499.99,
      sku: "SONY-A7IV-BODY",
      brandId: brds[2].id,
      categoryId: cats[5].id,
      stock: 20,
      rating: 4.8,
      reviewCount: 456,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
    },
    // Tablets
    {
      name: "iPad Pro M4 13-inch",
      slug: "ipad-pro-m4-13-inch",
      shortDescription: "The ultimate iPad experience with the M4 chip and Ultra Retina XDR display.",
      fullDescription: "iPad Pro 13-inch with M4 chip delivers incredible AI performance, a stunning Ultra Retina XDR display with tandem OLED, and all-day battery life. Supports Apple Pencil Pro and Magic Keyboard.",
      price: 1299.99,
      sku: "APL-IPPM4-13",
      brandId: brds[0].id,
      categoryId: cats[6].id,
      stock: 35,
      rating: 4.9,
      reviewCount: 321,
      // Newest product in the catalog (M4 chip) — anchors the New Arrivals row
      // so both homepage sets stay balanced (~5-6 each) without overlapping.
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
    },
  ];

  for (const product of productsList) {
    // drizzle decimal columns are typed as strings — convert numeric seed values.
    const [p] = await db
      .insert(products)
      .values({
        ...product,
        price: String(product.price),
        discountPrice: product.discountPrice != null ? String(product.discountPrice) : null,
        rating: String(product.rating),
      })
      .returning();

    // Product images — stored in Supabase Storage (products/{productId}/) when
    // configured, otherwise external placeholder URLs. First image is primary
    // and drives products.thumbnail_url.
    const seedImages: {
      productId: string;
      url: string;
      path: string | null;
      alt: string;
      order: number;
      isPrimary: boolean;
    }[] = [];
    for (let i = 0; i < 3; i++) {
      const uploaded = await uploadPlaceholder(p.id, p.name, i);
      seedImages.push(
        uploaded
          ? {
              productId: p.id,
              url: uploaded.url,
              path: uploaded.path,
              alt: i === 0 ? p.name : `${p.name} view ${i + 1}`,
              order: i,
              isPrimary: i === 0,
            }
          : {
              productId: p.id,
              url: `https://picsum.photos/seed/${p.slug}-${i + 1}/800/800`,
              path: null,
              alt: i === 0 ? p.name : `${p.name} view ${i + 1}`,
              order: i,
              isPrimary: i === 0,
            },
      );
    }
    await db.insert(productImages).values(seedImages);
    await db.update(products).set({ thumbnailUrl: seedImages[0].url }).where(eq(products.id, p.id));

    // Product specs
    await db.insert(productSpecs).values([
      { productId: p.id, key: "Brand", value: brds.find((b) => b.id === product.brandId)?.name || "" },
      { productId: p.id, key: "Category", value: cats.find((c) => c.id === product.categoryId)?.name || "" },
      { productId: p.id, key: "Warranty", value: "1 Year Manufacturer Warranty" },
      { productId: p.id, key: "Condition", value: "Brand New" },
    ]);
  }

  // Hero media
  await db.insert(heroMedia).values({
    videoUrl: "https://videos.pexels.com/video-files/3195398/3195398-uhd_2560_1440_30fps.mp4",
    headline: "Experience the Future of Technology",
    subheadline: "Premium gadgets delivered to your doorstep.",
    isActive: true,
  });

  // Banners
  await db.insert(banners).values([
    {
      title: "Gaming Collection",
      subtitle: "Level up your setup with the latest gaming gear",
      imageUrl: "https://picsum.photos/seed/gaming-banner/1200/400",
      linkUrl: "/category/gaming",
      position: "home",
      isActive: true,
    },
    {
      title: "Laptop Collection",
      subtitle: "Power and portability for every professional",
      imageUrl: "https://picsum.photos/seed/laptop-banner/1200/400",
      linkUrl: "/category/laptops",
      position: "home",
      isActive: true,
    },
  ]);

  // Settings
  await db.insert(settings).values([
    { key: "site_name", value: "Gadget Wallet" },
    { key: "site_description", value: "Premium electronics store - Experience the future of technology" },
    { key: "free_shipping_threshold", value: "100" },
    { key: "tax_rate", value: "0.08" },
    { key: "currency", value: "USD" },
  ]);

  console.log("Seed completed successfully!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
