import { Container, Button, Card, Badge } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { Star, Truck, Shield, Wallet, Lock, Clock } from "lucide-react";
import api from "../lib/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images?: { url: string; alt: string }[];
  rating: number;
  reviewCount: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
}

const categories = [
  { name: "Smartphones", slug: "smartphones", img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=128&q=80" },
  { name: "Laptops", slug: "laptops", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=128&q=80" },
  { name: "Smartwatches", slug: "smartwatches", img: "https://images.unsplash.com/photo-1546868871-af0de0ae72d8?w=128&q=80" },
  { name: "Headphones", slug: "headphones", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=128&q=80" },
  { name: "Gaming", slug: "gaming", img: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=128&q=80" },
  { name: "Cameras", slug: "cameras", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=128&q=80" },
];

const brands = ["Apple", "Samsung", "Sony", "ASUS", "Logitech", "Dell", "Bose", "Canon"];

const reviews = [
  { name: "Alex M.", text: "Absolutely love my new MacBook! The delivery was incredibly fast and the packaging was premium.", rating: 5 },
  { name: "Sarah K.", text: "Best electronics store I've ever shopped at. The customer service is outstanding.", rating: 5 },
  { name: "James R.", text: "Got my Sony headphones at an amazing price. Will definitely be a returning customer.", rating: 5 },
  { name: "Emma L.", text: "The iPhone arrived in 2 days. Authentic product with official warranty. Highly recommended!", rating: 5 },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/products/featured"),
      api.get("/products/new-arrivals"),
    ]).then(([f, n]) => {
      setFeatured(f.data.data || []);
      setNewArrivals(n.data.data || []);
    });
  }, []);

  return (
    <div>
      <section className="pt-0">
        <Container>
          <div className="relative min-h-[520px] rounded-hero overflow-hidden bg-gw-black">
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/25 z-10" />
            <img
              src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1320&q=80"
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-20 flex items-center min-h-[520px] px-10 md:px-16">
              <div className="max-w-[520px]">
                <p className="text-gw-red font-semibold text-sm mb-3 tracking-wider uppercase">Premium Electronics Store</p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                  Experience the Future of Technology
                </h1>
                <p className="text-white/70 text-lg mb-8">
                  Premium gadgets delivered to your doorstep with official warranty.
                </p>
                <div className="flex gap-3">
                  <a href="/shop">
                    <Button variant="primary" size="lg" className="rounded-full px-8">
                      Shop Now
                    </Button>
                  </a>
                  <a href="/categories">
                    <Button variant="outline" size="lg" className="rounded-full px-8 border-white/30 text-white hover:bg-white/10">
                      Explore Collection
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "2-5 business days" },
              { icon: Shield, title: "Official Warranty", desc: "100% authentic products" },
              { icon: Wallet, title: "Cash on Delivery", desc: "Pay when you receive" },
              { icon: Lock, title: "Secure Payment", desc: "256-bit SSL encrypted" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3.5 bg-white border border-gw-border rounded-[20px] p-5">
                <div className="w-12 h-12 rounded-full bg-gw-red/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-gw-red" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gw-black">{item.title}</p>
                  <p className="text-xs text-gw-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="section-header">
            <h2>Popular Categories</h2>
            <a href="/categories">View All &rarr;</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="bg-white border border-gw-border rounded-category p-6 text-center hover:-translate-y-1 hover:shadow-gw-md transition-all duration-300 group"
              >
                <img src={cat.img} alt={cat.name} className="w-16 h-16 object-contain mx-auto mb-3" />
                <p className="text-sm font-semibold text-gw-black group-hover:text-gw-red transition-colors">{cat.name}</p>
              </a>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="section-header">
            <h2>Featured Products</h2>
            <a href="/shop">View All &rarr;</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {featured.slice(0, 10).map((product, i) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-gw-bg">
        <Container>
          <div className="section-header">
            <h2>Flash Sale</h2>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {[
                  { label: "02", unit: "Hours" },
                  { label: "45", unit: "Mins" },
                  { label: "30", unit: "Secs" },
                ].map((t) => (
                  <div key={t.unit} className="w-14 h-14 rounded-xl bg-gw-black text-white flex flex-col items-center justify-center">
                    <span className="text-lg font-extrabold leading-none">{t.label}</span>
                    <span className="text-[10px] text-white/60">{t.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {featured.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} showSale />
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="section-header">
            <h2>New Arrivals</h2>
            <a href="/shop">View All &rarr;</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {newArrivals.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="section-header">
            <h2>Top Brands</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {brands.map((brand) => (
              <div key={brand} className="bg-white border border-gw-border rounded-category p-5 flex items-center justify-center hover:shadow-gw-sm transition-shadow cursor-pointer">
                <span className="text-sm font-bold text-gw-gray-300 opacity-70 hover:opacity-100 transition-opacity">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="section-header">
            <h2>What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white border border-gw-border rounded-[24px] p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gw-yellow text-gw-yellow" />
                  ))}
                </div>
                <p className="text-sm text-gw-gray-500 mb-4 leading-relaxed">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gw-red/10 flex items-center justify-center text-sm font-bold text-gw-red">
                    {r.name[0]}
                  </div>
                  <p className="text-sm font-semibold text-gw-black">{r.name}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="bg-gw-black rounded-newsletter p-10 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">Stay Updated</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Subscribe to get notified about new arrivals, exclusive deals, and tech news.
            </p>
            <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-[52px] px-6 rounded-full border-none bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gw-red/50"
              />
              <Button variant="primary" size="lg" className="rounded-full px-8 h-[52px]">
                Subscribe
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function ProductCard({ product, showSale }: { product: Product; showSale?: boolean }) {
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <a
      href={`/product/${product.slug}`}
      className="bg-white rounded-product border border-gw-border overflow-hidden hover:-translate-y-1.5 hover:shadow-gw-lg transition-all duration-300 group"
    >
      <div className="relative p-5 bg-white">
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-gw-red text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
            -{discount}%
          </span>
        )}
        {showSale && (
          <span className="absolute top-3 right-3 bg-gw-yellow text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
            Sale
          </span>
        )}
        <img
          src={product.images?.[0]?.url || `https://picsum.photos/seed/${product.slug}/400/400`}
          alt={product.name}
          className="w-full aspect-square object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="px-5 pb-5">
        <h3 className="text-sm font-semibold text-gw-black line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3.5 h-3.5 fill-gw-yellow text-gw-yellow" />
          <span className="text-xs text-gw-gray-500">{product.rating}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-gw-red">
            ${product.discountPrice || product.price}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gw-gray-300 line-through">${product.price}</span>
          )}
        </div>
        <button className="mt-4 w-full h-11 rounded-xl bg-gw-black text-white text-sm font-bold hover:bg-gw-red transition-all">
          Add to Cart
        </button>
      </div>
    </a>
  );
}
