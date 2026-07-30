import { Container, Button } from "@gadget-wallet/ui";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const wishlistItems = [
  { id: "1", name: "MacBook Pro 16 M3 Max", price: 2499.99, image: "https://picsum.photos/seed/macbook-pro-16-m3-max/400/400" },
  { id: "2", name: "Apple Watch Ultra 2", price: 799.99, image: "https://picsum.photos/seed/apple-watch-ultra-2/400/400" },
];

export default function Wishlist() {
  return (
    <section>
      <Container>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gw-black">My Wishlist</h2>
          <span className="text-gw-gray-500 text-sm">{wishlistItems.length} items</span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gw-gray-300 mx-auto mb-4" />
            <p className="text-gw-gray-500">Your wishlist is empty</p>
            <Link to="/shop"><Button variant="primary" className="mt-4">Browse Products</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-product border border-gw-border overflow-hidden group">
                <div className="relative p-5 bg-white">
                  <img src={item.image} alt={item.name} className="w-full aspect-square object-contain" loading="lazy" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-gw-sm flex items-center justify-center text-gw-red">
                    <Heart className="w-4 h-4 fill-gw-red" />
                  </button>
                </div>
                <div className="px-5 pb-5">
                  <h3 className="text-sm font-semibold text-gw-black truncate">{item.name}</h3>
                  <p className="text-2xl font-extrabold text-gw-red mt-2">${item.price}</p>
                  <button className="mt-4 w-full h-11 rounded-xl bg-gw-black text-white text-sm font-bold hover:bg-gw-red transition-all">
                    <ShoppingBag className="w-4 h-4 inline mr-2" /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
