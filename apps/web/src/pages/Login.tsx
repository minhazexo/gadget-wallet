import { Container, Button, Input } from "@gadget-wallet/ui";
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
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <section>
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-[24px] border border-gw-border p-8">
            <h1 className="text-2xl font-bold text-gw-black mb-2 text-center">Welcome Back</h1>
            <p className="text-gw-gray-500 text-center mb-8">Sign in to your Gadget Wallet account</p>
            {error && <p className="text-gw-red text-sm mb-4 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-gw-red hover:text-gw-red-hover">Forgot password?</Link>
              </div>
              <Button type="submit" variant="primary" className="w-full h-12">Sign In</Button>
            </form>
            <p className="text-center text-sm text-gw-gray-500 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-gw-red hover:text-gw-red-hover font-medium">Create one</Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
