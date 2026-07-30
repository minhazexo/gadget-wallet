import { Container, Button } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-8xl font-display font-bold gradient-text mb-4">404</h1>
          <p className="text-xl text-gw-text-secondary mb-8">The page you're looking for doesn't exist.</p>
          <a href="/">
            <Button variant="primary">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </a>
        </motion.div>
      </Container>
    </div>
  );
}
