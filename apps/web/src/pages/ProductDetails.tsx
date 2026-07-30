import { Container, Button, Badge, Card } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Heart, Share2, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import api from "../lib/api";

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  shortDescription: string;
  fullDescription: string;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images?: { url: string; alt: string }[];
  specs?: { key: string; value: string }[];
}

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      api.get(`/products/${slug}`).then((res) => setProduct(res.data.data));
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-pulse text-gw-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square rounded-xl overflow-hidden bg-gw-surface mb-4">
              <img
                src={product.images?.[selectedImage]?.url || `https://picsum.photos/seed/${slug}/800/800`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-gw-accent" : "border-transparent"}`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              {product.isNewArrival && <Badge variant="new">New Arrival</Badge>}
              {product.isBestSeller && <Badge variant="best">Best Seller</Badge>}
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-1 mb-4">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-gw-text-secondary">({product.reviewCount} reviews)</span>
            </div>
            <p className="text-gw-text-secondary mb-6">{product.shortDescription}</p>

            <div className="flex items-center gap-3 mb-6">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-gw-accent">${product.discountPrice}</span>
                  <span className="text-xl text-gw-text-secondary line-through">${product.price}</span>
                </>
              ) : (
                <span className="text-3xl font-bold">${product.price}</span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-white/10 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-gw-accent">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 font-semibold min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-gw-accent">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <Button variant="primary" size="lg">Add to Cart</Button>
              <Button variant="outline" size="lg">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="lg">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <Button variant="secondary" size="lg" className="w-full mb-8">Buy Now</Button>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card glass className="p-4 text-center">
                <Truck className="w-6 h-6 text-gw-accent mx-auto mb-2" />
                <p className="text-xs text-gw-text-secondary">Free Shipping</p>
              </Card>
              <Card glass className="p-4 text-center">
                <Shield className="w-6 h-6 text-gw-accent mx-auto mb-2" />
                <p className="text-xs text-gw-text-secondary">2 Year Warranty</p>
              </Card>
              <Card glass className="p-4 text-center">
                <RotateCcw className="w-6 h-6 text-gw-accent mx-auto mb-2" />
                <p className="text-xs text-gw-text-secondary">30-Day Returns</p>
              </Card>
            </div>

            <div className="text-sm text-gw-text-secondary">
              <p>SKU: {product.sku}</p>
              <p>Stock: {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}</p>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
          <h2 className="text-2xl font-display font-bold mb-6">Product Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <p className="text-gw-text-secondary leading-relaxed">{product.fullDescription}</p>
            </div>
            <Card>
              <div className="divide-y divide-white/10">
                {product.specs?.map((spec) => (
                  <div key={spec.key} className="flex justify-between py-3 px-4">
                    <span className="text-gw-text-secondary">{spec.key}</span>
                    <span className="font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
