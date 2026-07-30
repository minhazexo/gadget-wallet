import { Container, Button, Input, Card } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Container>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-display font-bold mb-2">Reset Password</h1>
            {sent ? (
              <>
                <p className="text-gw-text-secondary mb-6">Check your email for the reset link.</p>
                <Link to="/login"><Button variant="primary">Back to Login</Button></Link>
              </>
            ) : (
              <>
                <p className="text-gw-text-secondary mb-8">Enter your email and we'll send you a reset link.</p>
                <div className="space-y-4">
                  <Input label="Email" type="email" id="email" placeholder="your@email.com" />
                  <Button variant="primary" className="w-full" onClick={() => setSent(true)}>
                    Send Reset Link
                  </Button>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
