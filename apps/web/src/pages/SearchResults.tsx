import { Container, Card, Button } from "@gadget-wallet/ui";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function SearchResults() {
  return (
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gw-text-secondary" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 bg-gw-surface border border-white/10 rounded-xl text-gw-text-primary placeholder:text-gw-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gw-accent/50 text-lg"
            />
          </div>
        </div>
        <p className="text-center text-gw-text-secondary">Showing results for your search query</p>
      </Container>
    </div>
  );
}
