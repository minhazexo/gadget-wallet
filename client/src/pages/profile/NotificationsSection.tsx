import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Bell, Package, Megaphone, MessageSquare, Smartphone, CheckCheck } from "lucide-react";
import { Button } from "@gadget-wallet/ui";
import api from "../../lib/api";
import { showToast } from "../../store/useToastStore";
import { SectionHeader, Toggle, EmptyState, formatDate } from "./shared";

interface Prefs {
  orderUpdates: boolean;
  promotional: boolean;
  sms: boolean;
  push: boolean;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const defaultPrefs: Prefs = { orderUpdates: true, promotional: true, sms: false, push: true };

const prefOptions: { key: keyof Prefs; label: string; description: string; icon: any }[] = [
  { key: "orderUpdates", label: "Order Updates", description: "Order placed, shipped, delivered and cancelled", icon: Package },
  { key: "promotional", label: "Promotional Emails", description: "Sales, deals and new product announcements", icon: Megaphone },
  { key: "sms", label: "SMS Notifications", description: "Delivery alerts sent via text message", icon: MessageSquare },
  { key: "push", label: "Push Notifications", description: "Real-time alerts in your browser", icon: Smartphone },
];

export function NotificationsSection() {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [saving, setSaving] = useState<keyof Prefs | null>(null);

  const load = useCallback(async () => {
    try {
      const [prefsRes, notifRes] = await Promise.all([api.get("/notifications/preferences"), api.get("/notifications")]);
      setPrefs({ ...defaultPrefs, ...(prefsRes.data.data || {}) });
      setNotifications(notifRes.data.data || []);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePref = async (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(key);
    try {
      await api.put("/notifications/preferences", { [key]: next[key] });
      showToast("Notification preferences updated", "info");
    } catch {
      setPrefs(prefs);
      showToast("Failed to update preferences", "error");
    } finally {
      setSaving(null);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
      showToast("All notifications marked as read", "info");
    } catch {
      showToast("Failed to update notifications", "error");
    }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SectionHeader title="Notifications" subtitle="Choose what updates you want to receive" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="gw-panel-category p-6">
          <h4 className="gw-heading mb-4">Notification Preferences</h4>
          <div className="space-y-1">
            {prefOptions.map((opt) => (
              <div key={opt.key} className="flex items-center justify-between gap-4 py-3 border-b border-gw-border/50 dark:border-gray-700/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gw-red/10 flex items-center justify-center shrink-0">
                    <opt.icon className="w-4 h-4 text-gw-red" />
                  </div>
                  <div>
                    <p className="text-sm font-medium gw-text-body">{opt.label}</p>
                    <p className="gw-muted-xs">{opt.description}</p>
                  </div>
                </div>
                <div className="opacity-60">
                  <Toggle checked={prefs[opt.key]} onChange={() => togglePref(opt.key)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gw-panel-category p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="gw-heading">
              Recent Notifications
              {unread > 0 && (
                <span className="ml-2 gw-status-badge--compact text-[11px] font-bold bg-gw-red text-white">{unread} new</span>
              )}
            </h4>
            {unread > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                <CheckCheck className="w-4 h-4 mr-1.5" /> Mark all read
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <EmptyState icon={<Bell className="w-14 h-14" />} title="No notifications yet" subtitle="Order updates will appear here" />
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-3.5 text-sm ${n.isRead ? "border-gw-border dark:border-gray-700" : "border-gw-red/30 bg-gw-red/[0.03]"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className={`gw-heading ${n.isRead ? "" : "text-gw-red"}`}>{n.title}</p>
                    <span className="text-xs text-gw-gray-300 dark:text-gray-600 shrink-0">{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="gw-muted mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
