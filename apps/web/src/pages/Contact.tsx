import { Container, Button, Input, Card } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-4">Contact Us</h1>
          <p className="text-gw-text-secondary mb-10">We'd love to hear from you. Get in touch with our team.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-gw-accent mt-1" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gw-text-secondary">support@gadgetwallet.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-gw-accent mt-1" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-gw-text-secondary">+1 (555) 000-0000</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-gw-accent mt-1" />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-gw-text-secondary">123 Tech Street, San Francisco, CA 94102</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-gw-accent mt-1" />
                  <div>
                    <h3 className="font-semibold">Business Hours</h3>
                    <p className="text-gw-text-secondary">Mon - Fri: 9AM - 6PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Send us a Message</h2>
              <div className="space-y-4">
                <Input label="Name" placeholder="Your name" />
                <Input label="Email" type="email" placeholder="your@email.com" />
                <div>
                  <label className="block text-sm font-medium text-gw-text-secondary mb-1.5">Message</label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-2.5 bg-gw-surface border border-white/10 rounded-lg text-gw-text-primary placeholder:text-gw-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gw-accent/50 resize-none"
                  />
                </div>
                <Button variant="primary">Send Message</Button>
              </div>
            </Card>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
