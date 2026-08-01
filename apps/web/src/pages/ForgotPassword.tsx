import { Container, Button, Input } from "@gadget-wallet/ui";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  return (
    <section className="gw-section">
      <Container>
        <div className="gw-auth-wrap">
          <div className="gw-panel-light p-8 text-center">
            <h1 className="text-2xl font-bold text-gw-black mb-2">Reset Password</h1>
            {sent ? (
              <>
                <p className="text-gw-gray-500 mb-6">Check your email for the reset link.</p>
                <Link to="/login"><Button variant="primary">Back to Login</Button></Link>
              </>
            ) : (
              <>
                <p className="text-gw-gray-500 mb-8">Enter your email and we'll send you a reset link.</p>
                <div className="space-y-4">
                  <Input label="Email" type="email" id="email" placeholder="your@email.com" />
                  <Button variant="primary" className="w-full h-12" onClick={() => setSent(true)}>Send Reset Link</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
