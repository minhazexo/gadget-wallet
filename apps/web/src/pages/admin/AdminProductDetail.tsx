import { Container, Button, Badge } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  images: { id: string; url: string; alt: string; order: number }[];
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
        <div className="flex items-center justify-center min-h-[50vh] text-gw-gray-500">
          <div className="animate-pulse">Loading product details...</div>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-8">
        <div className="text-center py-20">
          <p className="text-gw-gray-500 mb-4">Product not found</p>
          <Link to="/admin/products">
            <Button variant="primary">Back to Products</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const discount = product.discountPrice
    ? Math.round(((parseFloat(product.price) - parseFloat(product.discountPrice)) / parseFloat(product.price)) * 100)
    : 0;

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/products"
            className="w-10 h-10 rounded-xl border border-gw-border flex items-center justify-center text-gw-gray-300 hover:text-gw-red hover:border-gw-red transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gw-black">{product.name}</h2>
            <p className="text-sm text-gw-gray-500">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/product/${product.slug}`} target="_blank">
            <Button variant="outline" className="h-11 text-xs">View on Store</Button>
          </Link>
          <Link to={`/admin/products`}>
            <Button variant="dark" className="h-11">
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          </Link>
          <Button variant="ghost" className="h-11 text-gw-red hover:text-gw-red" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gw-border rounded-[24px] overflow-hidden mb-4">
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
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-6 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all bg-white p-2 ${
                    selectedImage === i ? "border-gw-red" : "border-gw-border hover:border-gw-gray-300"
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Status badges */}
          <div className="bg-white border border-gw-border rounded-[24px] p-6">
            <div className="flex flex-wrap gap-2 mb-5">
              {product.isFeatured && <Badge variant="default">Featured</Badge>}
              {product.isNewArrival && <Badge variant="new">New Arrival</Badge>}
              {product.isBestSeller && <Badge variant="sale">Best Seller</Badge>}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-extrabold text-gw-red">
                ${product.discountPrice || product.price}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-lg text-gw-gray-300 line-through">${product.price}</span>
                  <span className="text-xs font-bold text-gw-green bg-gw-green/10 px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 text-sm mb-4">
              <Package className="w-4 h-4 text-gw-gray-300" />
              <span className={product.stock > 0 ? "text-gw-green font-medium" : "text-gw-red font-medium"}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 text-sm mb-4">
              <Star className="w-4 h-4 fill-gw-yellow text-gw-yellow" />
              <span className="font-semibold text-gw-black">{product.rating}</span>
              <span className="text-gw-gray-500">({product.reviewCount} reviews)</span>
            </div>

            {/* Meta info */}
            <div className="space-y-2.5 text-sm border-t border-gw-border pt-4">
              <div className="flex items-center gap-2 text-gw-gray-500">
                <Tag className="w-4 h-4" />
                <span className="text-gw-gray-300">Category:</span>
                <span className="text-gw-black font-medium">{product.categoryName}</span>
              </div>
              <div className="flex items-center gap-2 text-gw-gray-500">
                <Layers className="w-4 h-4" />
                <span className="text-gw-gray-300">Brand:</span>
                <span className="text-gw-black font-medium">{product.brandName}</span>
              </div>
              <div className="flex items-center gap-2 text-gw-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="text-gw-gray-300">Created:</span>
                <span className="text-gw-black font-medium">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gw-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-gw-gray-300">Updated:</span>
                <span className="text-gw-black font-medium">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-gw-border rounded-[24px] p-6">
            <h3 className="text-sm font-semibold text-gw-black mb-2">Short Description</h3>
            <p className="text-sm text-gw-gray-500 leading-relaxed">{product.shortDescription}</p>
          </div>
        </div>
      </div>

      {/* Full Description & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white border border-gw-border rounded-[24px] p-6">
          <h3 className="text-lg font-bold text-gw-black mb-4">Full Description</h3>
          <p className="text-sm text-gw-gray-500 leading-relaxed whitespace-pre-line">{product.fullDescription}</p>
        </div>

        <div className="bg-white border border-gw-border rounded-[24px] p-6">
          <h3 className="text-lg font-bold text-gw-black mb-4">Specifications</h3>
          {product.specs.length === 0 ? (
            <p className="text-sm text-gw-gray-500">No specifications added yet.</p>
          ) : (
            <div className="divide-y divide-gw-border">
              {product.specs.map((spec) => (
                <div key={spec.id} className="flex justify-between py-3">
                  <span className="text-sm text-gw-gray-500">{spec.key}</span>
                  <span className="text-sm font-medium text-gw-black">{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Images Gallery */}
      {product.images.length > 0 && (
        <div className="bg-white border border-gw-border rounded-[24px] p-6 mt-8">
          <h3 className="text-lg font-bold text-gw-black mb-4">All Images ({product.images.length})</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {product.images.map((img, i) => (
              <div
                key={img.id}
                className="aspect-square rounded-xl overflow-hidden border border-gw-border bg-white p-3 cursor-pointer hover:border-gw-red transition-all"
                onClick={() => setSelectedImage(i)}
              >
                <img src={img.url} alt={img.alt} className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
