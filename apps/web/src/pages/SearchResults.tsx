import { Container } from "@gadget-wallet/ui";
import { Search } from "lucide-react";

export default function SearchResults() {
  return (
    <section>
      <Container>
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gw-gray-300" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-4 h-[52px] bg-white border border-gw-border rounded-full text-gw-black placeholder:text-gw-gray-300 focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red"
            />
          </div>
        </div>
        <p className="text-center text-gw-gray-500">Showing results for your search query</p>
      </Container>
    </section>
  );
}
