import { Container, Button, Card, Badge } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Grid3X3, List } from "lucide-react";
import api from "../lib/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  shortDescription: string;
  rating: number;
  reviewCount: number;
  images?: { url: string; alt: string }[];
}

export default function Shop() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const url = slug ? `/products?category=${slug}` : "/products";
    api.get(url).then((res) => setProducts(res.data.data || []));
  }, [slug]);

  return (
    <section>
      <Container>
        <div className="section-header">
          <div>
            <h2>{slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "All Products"}</h2>
            <p className="text-sm text-gw-gray-500 font-normal">{products.length} products found</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-gw-red/10 text-gw-red" : "text-gw-gray-300 hover:text-gw-gray-500"}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-gw-red/10 text-gw-red" : "text-gw-gray-300 hover:text-gw-gray-500"}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5" : "space-y-4"}>
          {products.map((product) => {
            const discount = product.discountPrice
              ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
              : 0;

            return (
              <a
                key={product.id}
                href={`/product/${product.slug}`}
                className={`bg-white rounded-product border border-gw-border overflow-hidden hover:-translate-y-1.5 hover:shadow-gw-lg transition-all duration-300 group ${view === "list" ? "flex" : ""}`}
              >
                <div className={`relative bg-white ${view === "list" ? "w-48 h-48 shrink-0 p-4" : "p-5"}`}>
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-gw-red text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
                      -{discount}%
                    </span>
                  )}
                  <img
                    src={product.images?.[0]?.url || `https://picsum.photos/seed/${product.slug}/400/400`}
                    alt={product.name}
                    className={`object-contain transition-transform duration-300 group-hover:scale-105 ${view === "list" ? "w-full h-full" : "w-full aspect-square"}`}
                    loading="lazy"
                  />
                </div>
                <div className={view === "list" ? "p-5 flex-1 flex flex-col justify-center" : "px-5 pb-5"}>
                  <h3 className="text-sm font-semibold text-gw-black line-clamp-2">{product.name}</h3>
                  {view === "list" && (
                    <p className="text-sm text-gw-gray-500 mt-1 line-clamp-2">{product.shortDescription}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star className="w-3.5 h-3.5 fill-gw-yellow text-gw-yellow" />
                    <span className="text-xs text-gw-gray-500">{product.rating}</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-gw-red">${product.discountPrice || product.price}</span>
                    {product.discountPrice && <span className="text-sm text-gw-gray-300 line-through">${product.price}</span>}
                  </div>
                  <button className="mt-4 w-full h-11 rounded-xl bg-gw-black text-white text-sm font-bold hover:bg-gw-red transition-all">
                    Add to Cart
                  </button>
                </div>
              </a>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
