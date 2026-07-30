import { Container } from "@gadget-wallet/ui";
import { Smartphone, Laptop, Watch, Headphones, Gamepad2, Camera, Tablet, Cable } from "lucide-react";

const categories = [
  { name: "Smartphones", slug: "smartphones", icon: Smartphone, count: 45 },
  { name: "Laptops", slug: "laptops", icon: Laptop, count: 32 },
  { name: "Smartwatches", slug: "smartwatches", icon: Watch, count: 28 },
  { name: "Headphones", slug: "headphones", icon: Headphones, count: 56 },
  { name: "Gaming", slug: "gaming", icon: Gamepad2, count: 41 },
  { name: "Cameras", slug: "cameras", icon: Camera, count: 19 },
  { name: "Tablets", slug: "tablets", icon: Tablet, count: 23 },
  { name: "Accessories", slug: "accessories", icon: Cable, count: 67 },
];

export default function Categories() {
  return (
    <section>
      <Container>
        <div className="section-header">
          <h2>Categories</h2>
        </div>
        <p className="text-gw-gray-500 mb-8 -mt-5">Browse our wide selection of electronics</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <a
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="bg-white border border-gw-border rounded-category p-6 text-center hover:-translate-y-1 hover:shadow-gw-md transition-all duration-300 group"
              >
                <Icon className="w-14 h-14 text-gw-red mx-auto mb-3" />
                <h3 className="font-semibold text-gw-black group-hover:text-gw-red transition-colors">{cat.name}</h3>
                <p className="text-sm text-gw-gray-500 mt-1">{cat.count} products</p>
              </a>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
