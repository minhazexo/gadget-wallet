import { Container, Button, Input } from "@gadget-wallet/ui";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, name, password);
      navigate("/");
    } catch {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <section>
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-[24px] border border-gw-border p-8">
            <h1 className="text-2xl font-bold text-gw-black mb-2 text-center">Create Account</h1>
            <p className="text-gw-gray-500 text-center mb-8">Join Gadget Wallet today</p>
            {error && <p className="text-gw-red text-sm mb-4 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Email" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              <Button type="submit" variant="primary" className="w-full h-12">Create Account</Button>
            </form>
            <p className="text-center text-sm text-gw-gray-500 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-gw-red hover:text-gw-red-hover font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
