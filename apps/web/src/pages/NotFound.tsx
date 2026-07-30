import { Container, Button } from "@gadget-wallet/ui";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center">
      <Container>
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white border border-gw-border rounded-[24px] p-10">
            <h1 className="text-7xl font-extrabold text-gw-red mb-4">404</h1>
            <p className="text-gw-gray-500 mb-8">The page you're looking for doesn't exist.</p>
            <a href="/">
              <Button variant="primary" className="h-12">
                <Home className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
