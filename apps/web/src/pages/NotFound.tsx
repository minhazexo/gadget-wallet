import { Container, Button } from "@gadget-wallet/ui";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <section className="gw-section">
      <Container>
        <div className="text-center py-20">
          <h1 className="text-8xl font-extrabold text-gw-red mb-4">404</h1>
          <p className="text-xl text-gw-gray-500 mb-8">The page you're looking for doesn't exist.</p>
          <a href="/">
            <Button variant="primary"><Home className="w-4 h-4 mr-2" /> Back to Home</Button>
          </a>
        </div>
      </Container>
    </section>
  );
}
