import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Check } from "lucide-react";
import { Button, Input } from "@gadget-wallet/ui";
import api from "../../lib/api";
import { showToast } from "../../store/useToastStore";
import { SectionHeader, EmptyState, Modal } from "./shared";
import type { AddressItem } from "./types";
import { cn } from "@gadget-wallet/ui";

const emptyForm = { label: "", street: "", city: "", state: "", zip: "", country: "" };

export function AddressesSection() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AddressItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/address");
      setAddresses(data.data || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (addr: AddressItem) => {
    setEditing(addr);
    setForm({ label: addr.label, street: addr.street, city: addr.city, state: addr.state, zip: addr.zip, country: addr.country });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.label || !form.street || !form.city || !form.state || !form.zip || !form.country) {
      showToast("Please fill in all fields", "error");
      return;
    }
    try {
      if (editing) {
        await api.put(`/address/${editing.id}`, form);
        showToast("Address updated successfully");
      } else {
        await api.post("/address", { ...form, isDefault: addresses.length === 0 });
        showToast("Address added successfully");
      }
      setModalOpen(false);
      load();
    } catch {
      showToast("Failed to save address", "error");
    }
  };

  const remove = async (addr: AddressItem) => {
    try {
      await api.delete(`/address/${addr.id}`);
      showToast("Address deleted", "info");
      load();
    } catch {
      showToast("Failed to delete address", "error");
    }
  };

  const setDefault = async (addr: AddressItem) => {
    try {
      await api.post(`/address/${addr.id}/default`);
      showToast("Default address updated");
      load();
    } catch {
      showToast("Failed to set default address", "error");
    }
  };

  const fields: { key: keyof typeof emptyForm; label: string; placeholder: string; half?: boolean }[] = [
    { key: "label", label: "Label", placeholder: "Home / Office", half: true },
    { key: "country", label: "Country", placeholder: "United States", half: true },
    { key: "street", label: "Street Address", placeholder: "123 Main Street" },
    { key: "city", label: "City", placeholder: "San Francisco", half: true },
    { key: "state", label: "State", placeholder: "CA", half: true },
    { key: "zip", label: "ZIP Code", placeholder: "94102", half: true },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SectionHeader
        title="Saved Addresses"
        subtitle="Manage your shipping addresses"
        action={<Button variant="primary" size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" /> Add Address</Button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse gw-panel-category h-44" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="gw-panel-category">
          <EmptyState
            icon={<MapPin className="w-16 h-16" />}
            title="No saved addresses"
            subtitle="Add an address to speed up checkout"
            action={<Button variant="primary" onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" /> Add Address</Button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              layout
              whileHover={{ y: -3 }}
              className={cn(
                "bg-white dark:bg-gray-900 rounded-category border p-5 transition-colors",
                addr.isDefault ? "border-gw-red" : "border-gw-border dark:border-gray-700",
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="gw-heading capitalize">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="gw-status-badge--compact text-[11px] font-bold bg-gw-red text-white">Default</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(addr)} className="p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors" aria-label="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(addr)} className="p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors" aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="gw-muted-sm leading-relaxed">
                {addr.street}
                <br />
                {addr.city}, {addr.state} {addr.zip}
                <br />
                {addr.country}
              </p>
              {!addr.isDefault && (
                <button
                  onClick={() => setDefault(addr)}
                  className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gw-red hover:text-gw-red-hover"
                >
                  <Check className="w-3.5 h-3.5" /> Set as default
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? "Edit Address" : "Add Address"} onClose={() => setModalOpen(false)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className={!f.half ? "sm:col-span-2" : ""}>
              <Input
                label={f.label}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="primary" className="flex-1" onClick={save}>
            {editing ? "Save Changes" : "Add Address"}
          </Button>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
