import { Container, Button, Input, Card } from "@gadget-wallet/ui";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <section className="gw-section">
      <Container>
        <h1 className="gw-page-title-md">Contact Us</h1>
        <p className="gw-page-subtitle">We'd love to hear from you. Get in touch with our team.</p>

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
                  className="gw-form-input resize-none"
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
