import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Package, Eye, Truck, FileDown, XCircle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@gadget-wallet/ui";
import api from "../../lib/api";
import { showToast } from "../../store/useToastStore";
import { SectionHeader, EmptyState, StatusBadge, Modal, money, formatDate } from "./shared";
import type { Order } from "./types";
import { cn } from "@gadget-wallet/ui";

export function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trackOrder, setTrackOrder] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders");
      setOrders(data.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canCancel = (o: Order) => ["pending", "confirmed", "processing"].includes(o.status);
  const canReturn = (o: Order) => o.status === "delivered" && !o.returnRequestedAt;

  const cancelOrder = async (o: Order) => {
    try {
      await api.post(`/orders/${o.id}/cancel`);
      showToast("Order cancelled successfully");
      load();
    } catch {
      showToast("Failed to cancel order", "error");
    }
  };

  const requestReturn = async (o: Order) => {
    try {
      await api.post(`/orders/${o.id}/return`);
      showToast("Return request submitted");
      load();
    } catch {
      showToast("Failed to submit return request", "error");
    }
  };

  const downloadInvoice = (o: Order) => {
    window.open(`/api/orders/${o.id}/invoice`, "_blank");
  };

  const trackSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const currentStep = trackOrder ? trackSteps.indexOf(trackOrder.status) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SectionHeader title="Order History" subtitle="Track, manage, and review all your orders" />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse gw-panel-category p-5 h-32" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-16 h-16" />}
          title="No orders yet"
          subtitle="When you place an order, it will show up here"
          action={<a href="/shop"><Button variant="primary">Start Shopping</Button></a>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              className="gw-panel-category overflow-hidden"
            >
              {/* Order header */}
              <div className="p-5 border-b border-gw-border dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold gw-text-body">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="gw-muted-sm">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="gw-status-badge px-3 py-1 bg-gw-bg dark:bg-gray-800 text-gw-gray-500 dark:text-gray-300">
                      Payment: <StatusBadge status={order.paymentStatus} />
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="p-5">
                <div className="space-y-3">
                  {(order.items || []).slice(0, expanded === order.id ? undefined : 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white border border-gw-border p-1.5 shrink-0 overflow-hidden">
                        <img
                          src={item.image || `https://picsum.photos/seed/${item.slug || item.productId}/200/200`}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium gw-text-body truncate">{item.name}</p>
                        <p className="gw-muted-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="gw-heading-sm">{money(Number(item.price) * item.quantity)}</p>
                    </div>
                  ))}
                  {(order.items || []).length > 3 && (
                    <button
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      className="flex items-center gap-1 text-xs text-gw-red font-medium hover:text-gw-red-hover"
                    >
                      {expanded === order.id ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show all items</>}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gw-border dark:border-gray-700">
                  <p className="gw-muted-sm">
                    {order.paymentMethod} · <span className="gw-text-body font-bold">{money(order.total)}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setTrackOrder(order)}>
                      <Truck className="w-3.5 h-3.5 mr-1.5" /> Track Order
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadInvoice(order)}>
                      <FileDown className="w-3.5 h-3.5 mr-1.5" /> Invoice
                    </Button>
                    {canCancel(order) && (
                      <Button variant="ghost" size="sm" className="text-gw-red hover:text-gw-red-hover" onClick={() => cancelOrder(order)}>
                        <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel Order
                      </Button>
                    )}
                    {canReturn(order) && (
                      <Button variant="ghost" size="sm" className="text-gw-red hover:text-gw-red-hover" onClick={() => requestReturn(order)}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Return Request
                      </Button>
                    )}
                    {order.returnRequestedAt && (
                      <span className="gw-status-badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                        Return requested
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {expanded === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-gw-border dark:border-gray-700 text-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 gw-muted">
                      <div>
                        <p className="gw-heading mb-1">Shipping Address</p>
                        {order.shippingAddress ? (
                          <p>
                            {order.shippingAddress.label}
                            <br />
                            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                            {order.shippingAddress.zip}, {order.shippingAddress.country}
                          </p>
                        ) : (
                          <p>Not available</p>
                        )}
                      </div>
                      <div>
                        <p className="gw-heading mb-1">Summary</p>
                        <p>Subtotal: {money(order.subtotal)}</p>
                        <p>Discount: {money(order.discount)}</p>
                        <p>Shipping: {money(order.shipping)}</p>
                        <p className="font-bold gw-text-body">Total: {money(order.total)}</p>
                        {order.trackingNumber && <p className="mt-1">Tracking: {order.trackingNumber}</p>}
                        {order.estimatedDelivery && <p>Est. delivery: {formatDate(order.estimatedDelivery)}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Track order modal */}
      <Modal open={!!trackOrder} title={`Track Order #${trackOrder?.id.slice(0, 8).toUpperCase() || ""}`} onClose={() => setTrackOrder(null)}>
        {trackOrder && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-sm">
              <span className="gw-muted">Delivery Status</span>
              <StatusBadge status={trackOrder.status} />
            </div>
            <div className="space-y-0">
              {trackSteps.map((step, i) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        i <= currentStep ? "border-gw-red bg-gw-red" : "border-gw-gray-300 dark:border-gray-600",
                      )}
                    >
                      {i <= currentStep && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    {i < trackSteps.length - 1 && (
                      <div className={cn("w-0.5 h-8", i < currentStep ? "bg-gw-red" : "bg-gw-gray-300 dark:bg-gray-600")} />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className={cn("text-sm font-medium capitalize", i <= currentStep ? "gw-text-body" : "text-gw-gray-300")}>
                      {step}
                    </p>
                    {i === currentStep && <p className="text-xs text-gw-red">Current stage</p>}
                  </div>
                </div>
              ))}
            </div>
            {trackOrder.trackingNumber && (
              <div className="bg-gw-bg dark:bg-gray-800 rounded-xl p-4 text-sm">
                <p className="gw-muted">Tracking Number</p>
                <p className="gw-heading">{trackOrder.trackingNumber}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1" onClick={() => downloadInvoice(trackOrder)}>
                <FileDown className="w-4 h-4 mr-2" /> Download Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
