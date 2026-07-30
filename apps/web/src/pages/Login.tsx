import { Container, Button, Input, Card } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Container>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          <Card className="p-8">
            <h1 className="text-2xl font-display font-bold mb-2 text-center">Welcome Back</h1>
            <p className="text-gw-text-secondary text-center mb-8">Sign in to your Gadget Wallet account</p>
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-gw-accent hover:underline">Forgot password?</Link>
              </div>
              <Button type="submit" variant="primary" className="w-full">Sign In</Button>
            </form>
            <p className="text-center text-sm text-gw-text-secondary mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-gw-accent hover:underline">Create one</Link>
            </p>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
