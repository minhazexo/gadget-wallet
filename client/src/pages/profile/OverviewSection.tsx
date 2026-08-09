import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, Calendar, Shield, MapPin, Pencil, Camera, Loader2, Package, Heart, Star, BadgeCheck } from "lucide-react";
import { Button, Input } from "@gadget-wallet/ui";
import api from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";
import { showToast } from "../../store/useToastStore";
import { SectionHeader, Modal, formatDate, initials } from "./shared";

interface OverviewProps {
  stats: { orders: number; wishlist: number; reviews: number };
  defaultAddress: any;
  onNavigate: (tab: string) => void;
}

export function OverviewSection({ stats, defaultAddress, onNavigate }: OverviewProps) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editOpen && user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [editOpen, user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so selecting the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Please choose a JPG, PNG or WEBP image", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be 5 MB or smaller", "error");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/profile/avatar", form);
      updateUser({ avatar: data.data?.avatar || null });
      showToast("Profile photo updated");
    } catch {
      showToast("Failed to upload photo", "error");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/profile", { name, phone });
      updateUser(data.data);
      setEditOpen(false);
      showToast("Profile updated successfully");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const infoItems = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone || "Not added" },
    { icon: Calendar, label: "Member since", value: formatDate(user.createdAt) },
    {
      icon: Shield,
      label: "Account status",
      value: (
        <span className="inline-flex items-center gap-1 text-gw-green font-medium">
          <BadgeCheck className="w-4 h-4" /> {user.isActive ? "Active" : "Disabled"}
        </span>
      ),
    },
  ];

  const statCards = [
    { label: "Orders", value: stats.orders, icon: Package, tab: "orders" },
    { label: "Wishlist", value: stats.wishlist, icon: Heart, tab: "wishlist" },
    { label: "Reviews", value: stats.reviews, icon: Star, tab: "reviews" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SectionHeader title="Account Overview" subtitle="Your personal information and activity summary" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="lg:col-span-2 gw-panel p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-gw-red/10 flex items-center justify-center text-3xl font-extrabold text-gw-red overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  initials(user.name)
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gw-red text-white flex items-center justify-center shadow-gw-md hover:bg-gw-red-hover transition-colors disabled:opacity-70"
                aria-label="Change profile photo"
                title="Change profile photo"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-xl font-bold gw-text-body">{user.name}</h3>
              <p className="gw-muted-sm capitalize">{user.role}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-5 text-sm">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 gw-muted">
                    <item.icon className="w-4 h-4 text-gw-red shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-xs text-gw-gray-300 dark:text-gray-500">{item.label}</span>
                      <span className="font-medium gw-text-body break-all">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="primary" onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
            <Button variant="outline" onClick={() => onNavigate("security")}>
              <Shield className="w-4 h-4 mr-2" /> Security
            </Button>
          </div>
        </div>

        {/* Right column: stats + default address */}
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {statCards.map((s, i) => (
              <motion.button
                key={s.label}
                onClick={() => onNavigate(s.tab)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                whileHover={{ y: -3 }}
                className="gw-panel-category p-4 text-center hover:shadow-gw-md transition-shadow"
              >
                <s.icon className="w-5 h-5 text-gw-red mx-auto mb-1.5" />
                <p className="text-xl font-extrabold gw-text-body">{s.value}</p>
                <p className="gw-muted-xs">{s.label}</p>
              </motion.button>
            ))}
          </div>

          <div className="gw-panel-category p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gw-red" />
              <h4 className="gw-heading-sm">Default Shipping Address</h4>
            </div>
            {defaultAddress ? (
              <div className="gw-muted-sm space-y-0.5">
                <p className="font-medium gw-text-body">{defaultAddress.label}</p>
                <p>{defaultAddress.street}</p>
                <p>
                  {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zip}
                </p>
                <p>{defaultAddress.country}</p>
                <button
                  onClick={() => onNavigate("addresses")}
                  className="gw-link mt-2 text-xs"
                >
                  Manage addresses →
                </button>
              </div>
            ) : (
              <div className="gw-muted-sm">
                <p>No default address set.</p>
                <Link to="/profile?tab=addresses">
                  <button className="gw-link mt-2 text-xs">Add an address →</button>
                </Link>
              </div>
            )}
          </div>

          <div className="gw-panel-category p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-gw-green" />
              <h4 className="gw-heading-sm">Account Security</h4>
            </div>
            <p className="gw-muted-sm">
              Two-factor authentication is{" "}
              <span className={user.twoFactorEnabled ? "text-gw-green font-medium" : "text-gw-red font-medium"}>
                {user.twoFactorEnabled ? "enabled" : "disabled"}
              </span>
            </p>
            <button
              onClick={() => onNavigate("security")}
              className="gw-link mt-2 text-xs"
            >
              Manage security →
            </button>
          </div>
        </div>
      </div>

      <Modal open={editOpen} title="Edit Profile" onClose={() => setEditOpen(false)}>
        <div className="space-y-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
          <p className="text-xs gw-muted">
            Profile photo: click the camera icon on your avatar to upload a new image.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="primary" isLoading={saving} onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
