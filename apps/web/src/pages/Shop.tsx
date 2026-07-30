import { Container, Button, Card, Badge } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, SlidersHorizontal, Grid3X3, List } from "lucide-react";
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
  isNewArrival: boolean;
  isBestSeller: boolean;
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
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">
              {slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "All Products"}
            </h1>
            <p className="text-gw-text-secondary text-sm mt-1">{products.length} products found</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gw-text-secondary hover:text-gw-text-primary">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-2 ${view === "grid" ? "text-gw-accent" : "text-gw-text-secondary"}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 ${view === "list" ? "text-gw-accent" : "text-gw-text-secondary"}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {products.map((product, i) => (
            <motion.a
              key={product.id}
              href={`/product/${product.slug}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card
                className={
                  view === "list" ? "flex overflow-hidden" : "overflow-hidden"
                }
              >
                <div
                  className={
                    view === "list"
                      ? "w-48 h-48 shrink-0 bg-gw-surface"
                      : "aspect-square bg-gw-surface"
                  }
                >
                  <img
                    src={
                      product.images?.[0]?.url ||
                      `https://picsum.photos/seed/${product.slug}/400/400`
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {product.isNewArrival && <Badge variant="new">New</Badge>}
                    {product.isBestSeller && <Badge variant="best">Best</Badge>}
                  </div>
                  <h3 className="font-semibold">{product.name}</h3>
                  {view === "list" && (
                    <p className="text-sm text-gw-text-secondary mt-1 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gw-text-secondary">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {product.discountPrice ? (
                      <>
                        <span className="text-lg font-bold text-gw-accent">
                          ${product.discountPrice}
                        </span>
                        <span className="text-sm text-gw-text-secondary line-through">
                          ${product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold">${product.price}</span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.a>
          ))}
        </div>
      </Container>
    </div>
  );
}
