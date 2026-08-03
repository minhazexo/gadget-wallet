import { Container, Button, Badge } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Package,
  Tag,
  Layers,
  Calendar,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import api from "../../lib/api";
import {
  staggerContainer,
  staggerItem,
} from "../../lib/animations";
import { SectionReveal } from "../../components/PageTransition";

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  discountPrice?: string;
  sku: string;
  stock: number;
  rating: string;
  reviewCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  createdAt: string;
  updatedAt: string;
  brandName: string;
  categoryName: string;
  images: { id: string; url: string; alt: string; order: number; isPrimary: boolean }[];
  specs: { id: string; key: string; value: string }[];
}

export default function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const fetchProduct = () => {
    if (!id) return;
    setLoading(true);
    api.get(`/admin/products/${id}`)
      .then((res) => {
        setProduct(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!product || !confirm(`Delete "${product.name}"?`)) return;
    try {
      await api.delete(`/admin/products/${product.id}`);
      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  if (loading) {
    return (
      <Container className="py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-[50vh] text-gw-gray-500"
        >
          <div className="animate-pulse">Loading product details...</div>
        </motion.div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <p className="text-gw-gray-500 mb-4">Product not found</p>
          <Link to="/admin/products">
            <Button variant="primary">Back to Products</Button>
          </Link>
        </motion.div>
      </Container>
    );
  }

  const discount = product.discountPrice
    ? Math.round(((parseFloat(product.price) - parseFloat(product.discountPrice)) / parseFloat(product.price)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Container className="py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4 min-w-0">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="shrink-0">
              <Link
                to="/admin/products"
                className="w-10 h-10 rounded-xl border border-gw-border flex items-center justify-center text-gw-gray-300 hover:text-gw-red hover:border-gw-red transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </motion.div>
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-gw-black break-words">{product.name}</h2>
              <p className="text-sm text-gw-gray-500">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link to={`/product/${product.slug}`} target="_blank">
                <Button variant="outline" className="h-11 text-xs">View on Store</Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link to={`/admin/products/${product.id}/edit`}>
                <Button variant="dark" className="h-11">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button variant="ghost" className="h-11 text-gw-red hover:text-gw-red" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="gw-panel-light overflow-hidden mb-4"
            >
              <div className="aspect-square bg-white p-8 flex items-center justify-center">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]?.url}
                    alt={product.images[selectedImage]?.alt || product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-20 h-20 text-gw-gray-300 mx-auto mb-3" />
                    <p className="text-gw-gray-500 text-sm">No images</p>
                  </div>
                )}
              </div>
            </motion.div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
                {product.images.map((img, i) => (
                  <motion.button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-white p-2 ${
                      selectedImage === i ? "border-gw-red" : "border-gw-border hover:border-gw-gray-300"
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-contain" />
                    {img.isPrimary && (
                      <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gw-black text-white text-[9px] font-bold">
                        <Star className="w-2 h-2 fill-current" /> Cover
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-6"
          >
            {/* Status badges */}
            <div className="gw-panel-light p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-2 mb-5"
              >
                {product.isFeatured && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.3 }}>
                    <Badge variant="default">Featured</Badge>
                  </motion.div>
                )}
                {product.isNewArrival && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.35 }}>
                    <Badge variant="new">New Arrival</Badge>
                  </motion.div>
                )}
                {product.isBestSeller && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.4 }}>
                    <Badge variant="sale">Best Seller</Badge>
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-baseline gap-3 mb-5"
              >
                <span className="text-3xl font-extrabold text-gw-red">
                  ${product.discountPrice || product.price}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-lg text-gw-gray-300 line-through">${product.price}</span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35, type: "spring" }}
                      className="gw-status-badge--compact font-bold text-gw-green bg-gw-green/10"
                    >
                      -{discount}%
                    </motion.span>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-sm mb-4"
              >
                <Package className="w-4 h-4 text-gw-gray-300" />
                <span className={product.stock > 0 ? "text-gw-green font-medium" : "text-gw-red font-medium"}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-1.5 text-sm mb-4"
              >
                <Star className="w-4 h-4 fill-gw-yellow text-gw-yellow" />
                <span className="font-semibold text-gw-black">{product.rating}</span>
                <span className="text-gw-gray-500">({product.reviewCount} reviews)</span>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="space-y-2.5 text-sm border-t border-gw-border pt-4"
              >
                {[
                  { icon: Tag, label: "Category:", value: product.categoryName },
                  { icon: Layers, label: "Brand:", value: product.brandName },
                  { icon: Calendar, label: "Created:", value: new Date(product.createdAt).toLocaleDateString() },
                  { icon: Clock, label: "Updated:", value: new Date(product.updatedAt).toLocaleDateString() },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    variants={staggerItem}
                    className="flex items-center gap-2 text-gw-gray-500"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-gw-gray-300">{item.label}</span>
                    <span className="text-gw-black font-medium">{item.value}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="gw-panel-light p-6"
            >
              <h3 className="text-sm font-semibold text-gw-black mb-2">Short Description</h3>
              <p className="text-sm text-gw-gray-500 leading-relaxed">{product.shortDescription}</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Full Description & Specs */}
        <SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="gw-panel-light p-6"
            >
              <h3 className="text-lg font-bold text-gw-black mb-4">Full Description</h3>
              <p className="text-sm text-gw-gray-500 leading-relaxed whitespace-pre-line">{product.fullDescription}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="gw-panel-light p-6"
            >
              <h3 className="text-lg font-bold text-gw-black mb-4">Specifications</h3>
              {product.specs.length === 0 ? (
                <p className="text-sm text-gw-gray-500">No specifications added yet.</p>
              ) : (
                <div className="divide-y divide-gw-border">
                  {product.specs.map((spec, i) => (
                    <motion.div
                      key={spec.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex justify-between py-3"
                    >
                      <span className="text-sm text-gw-gray-500">{spec.key}</span>
                      <span className="text-sm font-medium text-gw-black">{spec.value}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </SectionReveal>

        {/* All Images Gallery */}
        {product.images.length > 0 && (
          <SectionReveal>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="gw-panel-light p-6 mt-8"
            >
              <h3 className="text-lg font-bold text-gw-black mb-4">All Images ({product.images.length})</h3>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3"
              >
                {product.images.map((img, i) => (
                  <motion.div
                    key={img.id}
                    variants={staggerItem}
                    whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                    className="aspect-square rounded-xl overflow-hidden border border-gw-border bg-white p-3 cursor-pointer hover:border-gw-red transition-all"
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-contain" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </SectionReveal>
        )}
      </Container>
    </motion.div>
  );
}
