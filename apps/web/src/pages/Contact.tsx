import { Container, Button, Input } from "@gadget-wallet/ui";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <section>
      <Container>
        <div className="section-header">
          <h2>Contact Us</h2>
        </div>
        <p className="text-gw-gray-500 mb-10 -mt-5">We'd love to hear from you. Get in touch with our team.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            {[
              { icon: Mail, title: "Email", desc: "support@gadgetwallet.com" },
              { icon: Phone, title: "Phone", desc: "+1 (555) 000-0000" },
              { icon: MapPin, title: "Address", desc: "123 Tech Street, San Francisco, CA 94102" },
              { icon: Clock, title: "Business Hours", desc: "Mon - Fri: 9AM - 6PM EST" },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gw-border rounded-category p-5 flex items-start gap-4 hover:shadow-gw-sm transition-all">
                <div className="w-10 h-10 rounded-full bg-gw-red/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-gw-red" />
                </div>
                <div>
                  <h3 className="font-semibold text-gw-black">{item.title}</h3>
                  <p className="text-sm text-gw-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gw-border rounded-[24px] p-6">
            <h3 className="text-lg font-semibold text-gw-black mb-6">Send us a Message</h3>
            <div className="space-y-4">
              <Input label="Name" placeholder="Your name" />
              <Input label="Email" type="email" placeholder="your@email.com" />
              <div>
                <label className="block text-sm font-medium text-gw-gray-700 mb-1.5">Message</label>
                <textarea
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2.5 bg-white border border-gw-border rounded-btn text-gw-black placeholder:text-gw-gray-300 focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red transition-all duration-200 resize-none"
                />
              </div>
              <Button variant="primary" className="h-12">Send Message</Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
