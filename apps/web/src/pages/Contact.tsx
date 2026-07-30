import { Container, Button, Input, Card } from "@gadget-wallet/ui";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <section>
      <Container>
        <h1 className="text-3xl font-bold text-gw-black mb-4">Contact Us</h1>
        <p className="text-gw-gray-500 mb-10">We'd love to hear from you. Get in touch with our team.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "support@gadgetwallet.com" },
              { icon: Phone, label: "Phone", value: "+1 (555) 000-0000" },
              { icon: MapPin, label: "Address", value: "123 Tech Street, San Francisco, CA 94102" },
              { icon: Clock, label: "Business Hours", value: "Mon - Fri: 9AM - 6PM EST" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <item.icon className="w-5 h-5 text-gw-red mt-1" />
                <div>
                  <h3 className="font-semibold text-gw-black">{item.label}</h3>
                  <p className="text-gw-gray-500">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="font-semibold text-lg text-gw-black mb-4">Send us a Message</h3>
            <div className="space-y-4">
              <Input label="Name" placeholder="Your name" />
              <Input label="Email" type="email" placeholder="your@email.com" />
              <div>
                <label className="block text-sm font-medium text-gw-gray-700 mb-1.5">Message</label>
                <textarea
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2.5 bg-white border border-gw-border rounded-btn text-gw-black placeholder:text-gw-gray-300 focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red resize-none"
                />
              </div>
              <Button variant="primary">Send Message</Button>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
