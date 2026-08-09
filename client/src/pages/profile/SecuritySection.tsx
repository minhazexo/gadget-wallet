import { motion } from "framer-motion";
import { useState } from "react";
import { KeyRound, Shield, LogOut } from "lucide-react";
import { Button, Input } from "@gadget-wallet/ui";
import { useAuthStore } from "../../store/useAuthStore";
import { showToast } from "../../store/useToastStore";
import { useCartStore } from "../../store/useCartStore";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { SectionHeader, Toggle } from "./shared";
import { cn } from "@gadget-wallet/ui";

function strengthOf(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["bg-red-500", "bg-red-500", "bg-yellow-500", "bg-green-500", "bg-green-600"];

export function SecuritySection() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logoutAll = useAuthStore((s) => s.logoutAll);
  const navigate = useNavigate();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changing, setChanging] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const strength = strengthOf(next);

  const changePassword = async () => {
    if (next.length < 8) {
      showToast("New password must be at least 8 characters", "error");
      return;
    }
    if (next !== confirm) {
      showToast("Passwords do not match", "error");
      return;
    }
    setChanging(true);
    try {
      await useAuthStore.getState().changePassword(current, next);
      showToast("Password changed successfully");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to change password", "error");
    } finally {
      setChanging(false);
    }
  };

  const toggle2FA = async (enabled: boolean) => {
    try {
      const res = await api.put("/profile/two-factor", { enabled });
      updateUser(res.data.data);
      showToast(enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled", "info");
    } catch {
      showToast("Failed to update two-factor settings", "error");
    }
  };

  const handleLogoutAll = async () => {
    setLoggingOut(true);
    try {
      await logoutAll();
      useCartStore.getState().clearCart();
      showToast("Logged out from all devices");
      navigate("/login");
    } catch {
      setLoggingOut(false);
      showToast("Failed to log out all devices", "error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SectionHeader title="Account Security" subtitle="Protect your account with a strong password" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Change password */}
        <div className="gw-panel-category p-6">
          <div className="flex items-center gap-2 mb-5">
            <KeyRound className="w-5 h-5 text-gw-red" />
            <h4 className="gw-heading">Change Password</h4>
          </div>
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              showPasswordToggle
            />
            <Input
              label="New Password"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              showPasswordToggle
            />
            {next && (
              <div>
                <div className="flex gap-1.5 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn("h-1.5 flex-1 rounded-full", i <= strength ? strengthColors[strength - 1] : "bg-gray-200 dark:bg-gray-700")}
                    />
                  ))}
                </div>
                <p className="gw-muted-xs">
                  Strength: <span className="font-medium gw-text-body">{strengthLabels[strength - 1]}</span> — use 8+ chars with upper & lowercase and numbers
                </p>
              </div>
            )}
            <Input
              label="Confirm New Password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={confirm && confirm !== next ? "Passwords do not match" : undefined}
              showPasswordToggle
            />
            <Button variant="primary" isLoading={changing} onClick={changePassword} className="w-full">
              Update Password
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          {/* 2FA */}
          <div className="gw-panel-category p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-5 h-5 text-gw-green" />
                  <h4 className="gw-heading">Two-Factor Authentication</h4>
                </div>
                <p className="gw-muted-sm">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Toggle checked={!!user?.twoFactorEnabled} onChange={toggle2FA} />
            </div>
          </div>

          {/* Logout all devices */}
          <div className="gw-panel-category p-6">
            <div className="flex items-center gap-2 mb-1">
              <LogOut className="w-5 h-5 text-gw-red" />
              <h4 className="gw-heading">Sessions</h4>
            </div>
            <p className="gw-muted-sm mb-4">
              Revoke access from all devices. You will need to sign in again everywhere.
            </p>
            <Button variant="outline" className="text-gw-red border-gw-red/30 hover:border-gw-red hover:text-gw-red" isLoading={loggingOut} onClick={handleLogoutAll}>
              <LogOut className="w-4 h-4 mr-2" /> Logout from all devices
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
