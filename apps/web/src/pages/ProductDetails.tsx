import { Container, Button, Badge } from "@gadget-wallet/ui";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gw-gray-500">Loading...</div>
      </div>
    );
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <section>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="aspect-square rounded-[24px] overflow-hidden bg-white border border-gw-border mb-4 p-8">
              <img
                src={product.images?.[selectedImage]?.url || `https://picsum.photos/seed/${slug}/800/800`}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors bg-white p-2 ${selectedImage === i ? "border-gw-red" : "border-gw-border"}`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              {product.isNewArrival && <Badge variant="new">New</Badge>}
              {product.isBestSeller && <Badge>Best Seller</Badge>}
            </div>
            <h1 className="text-3xl font-bold text-gw-black mb-4">{product.name}</h1>
            <div className="flex items-center gap-1 mb-4">
              <Star className="w-5 h-5 fill-gw-yellow text-gw-yellow" />
              <span className="font-semibold text-gw-black">{product.rating}</span>
              <span className="text-gw-gray-500">({product.reviewCount} reviews)</span>
            </div>
            <p className="text-gw-gray-500 mb-6 leading-relaxed">{product.shortDescription}</p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-extrabold text-gw-red">${product.discountPrice || product.price}</span>
              {product.discountPrice && (
                <>
                  <span className="text-xl text-gw-gray-300 line-through">${product.price}</span>
                  <span className="text-sm font-bold text-gw-green bg-gw-green/10 px-2.5 py-0.5 rounded-full">Save ${(product.price - product.discountPrice).toFixed(2)}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gw-border rounded-xl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-gw-red transition-colors">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-5 py-3 font-semibold min-w-[40px] text-center text-gw-black">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:text-gw-red transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <Button variant="dark" size="lg" className="flex-1 h-12">Add to Cart</Button>
              <button className="w-12 h-12 rounded-xl border border-gw-border flex items-center justify-center text-gw-gray-300 hover:text-gw-red hover:border-gw-red transition-all">
                <Heart className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-xl border border-gw-border flex items-center justify-center text-gw-gray-300 hover:text-gw-red hover:border-gw-red transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <Button variant="primary" size="lg" className="w-full mb-8 h-12">Buy Now</Button>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: Truck, label: "Free Shipping", sub: "On orders $100+" },
                { icon: Shield, label: "2 Year Warranty", sub: "Official" },
                { icon: RotateCcw, label: "30-Day Returns", sub: "Hassle free" },
              ].map((item) => (
                <div key={item.label} className="bg-white border border-gw-border rounded-xl p-4 text-center">
                  <item.icon className="w-6 h-6 text-gw-red mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-gw-black">{item.label}</p>
                  <p className="text-[11px] text-gw-gray-500">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="text-sm text-gw-gray-500 space-y-1">
              <p>SKU: <span className="text-gw-black font-medium">{product.sku}</span></p>
              <p>Stock: <span className={product.stock > 0 ? "text-gw-green font-medium" : "text-gw-red font-medium"}>
                {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
              </span></p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gw-black mb-6">Product Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <p className="text-gw-gray-500 leading-relaxed">{product.fullDescription}</p>
            </div>
            <div className="bg-white border border-gw-border rounded-[24px] overflow-hidden">
              <div className="divide-y divide-gw-border">
                {product.specs?.map((spec) => (
                  <div key={spec.key} className="flex justify-between py-3.5 px-5">
                    <span className="text-gw-gray-500 text-sm">{spec.key}</span>
                    <span className="font-medium text-sm text-gw-black">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
