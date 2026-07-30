import { Container, Button } from "@gadget-wallet/ui";
import { useParams } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <section>
      <Container>
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-[24px] border border-gw-border p-10">
            <CheckCircle className="w-20 h-20 text-gw-green mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gw-black mb-4">Order Placed!</h1>
            <p className="text-gw-gray-500 mb-6">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>
            <div className="inline-flex items-center gap-2 bg-gw-green/10 text-gw-green px-4 py-2 rounded-full mb-6">
              <Package className="w-5 h-5" />
              <span className="font-medium">Order #{id}</span>
            </div>
            <div className="space-y-3">
              <a href="/my-orders"><Button variant="primary" className="w-full h-12">Track Order</Button></a>
              <a href="/shop"><Button variant="outline" className="w-full h-12">Continue Shopping</Button></a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
