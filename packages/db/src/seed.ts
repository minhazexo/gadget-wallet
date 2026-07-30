import { db } from "./index";
import { users, categories, brands, products, productImages, productSpecs, heroMedia, banners, settings } from "./schema";
import bcrypt from "bcryptjs";

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
      isFeatured: true,
      isNewArrival: true,
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
      isFeatured: true,
      isNewArrival: true,
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
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
    },
  ];

  for (const product of productsList) {
    const [p] = await db.insert(products).values(product).returning();

    // Product images
    await db.insert(productImages).values([
      { productId: p.id, url: `https://picsum.photos/seed/${p.slug}-1/800/800`, alt: p.name, order: 0 },
      { productId: p.id, url: `https://picsum.photos/seed/${p.slug}-2/800/800`, alt: `${p.name} alternate view`, order: 1 },
      { productId: p.id, url: `https://picsum.photos/seed/${p.slug}-3/800/800`, alt: `${p.name} side view`, order: 2 },
    ]);

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
