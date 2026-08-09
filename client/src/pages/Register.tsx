import { Container, Button, Input } from "@gadget-wallet/ui";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const location = useLocation();

  // Destination to resume after registering (kept consistent with the login flow).
  const fromState = (location.state as { from?: string } | null)?.from;
  const from = fromState && fromState.startsWith("/") && !fromState.startsWith("//") ? fromState : "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, name, password);
      await Promise.all([
        useCartStore.getState().mergeGuestCart(),
        useWishlistStore.getState().load(),
      ]);
      navigate(from);
    } catch {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <section className="gw-section">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="gw-auth-wrap"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="gw-panel-light p-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="gw-auth-title"
            >
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="gw-auth-subtitle"
            >
              Join Gadget Wallet today
            </motion.p>
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-gw-red text-sm mb-4 text-center"
              >
                {error}
              </motion.p>
            )}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {[
                { label: "Full Name", id: "name", value: name, set: setName, type: "text" },
                { label: "Email", id: "email", value: email, set: setEmail, type: "email" },
                { label: "Password", id: "password", value: password, set: setPassword, type: "password" },
              ].map((field, i) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                >
                  <Input
                    label={field.label}
                    type={field.type}
                    id={field.id}
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    required
                    minLength={field.id === "password" ? 6 : undefined}
                    showPasswordToggle={field.type === "password"}
                  />
                </motion.div>
              ))}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button type="submit" variant="primary" className="w-full h-12">
                  Create Account
                </Button>
              </motion.div>
            </motion.form>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-center text-sm text-gw-gray-500 mt-6"
            >
              Already have an account?{" "}
              <Link to="/login" state={{ from }} className="gw-link">Sign in</Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
