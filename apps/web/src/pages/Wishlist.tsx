import { Container, Button, Card } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const wishlistItems = [
  { id: "1", name: "MacBook Pro 16 M3 Max", price: 2499.99, image: "https://picsum.photos/seed/macbook-pro-16-m3-max/400/400" },
  { id: "2", name: "Apple Watch Ultra 2", price: 799.99, image: "https://picsum.photos/seed/apple-watch-ultra-2/400/400" },
];

export default function Wishlist() {
  return (
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold">My Wishlist</h1>
          <span className="text-gw-text-secondary">{wishlistItems.length} items</span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gw-text-secondary/30 mx-auto mb-4" />
            <p className="text-gw-text-secondary">Your wishlist is empty</p>
            <Link to="/shop">
              <Button variant="primary" className="mt-4">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden group">
                  <div className="aspect-square bg-gw-surface relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    <button className="absolute top-3 right-3 p-2 bg-gw-bg/80 rounded-full text-red-400 hover:bg-gw-bg">
                      <Heart className="w-4 h-4 fill-red-400" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <p className="text-gw-accent font-bold mt-1">${item.price}</p>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
