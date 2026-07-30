import { Container, Card, Input, Button } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin } from "lucide-react";

export default function Profile() {
  return (
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-8">My Profile</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-6 lg:col-span-2">
              <h2 className="font-semibold text-lg mb-6">Personal Information</h2>
              <div className="space-y-4">
                <Input label="Full Name" defaultValue="John Doe" />
                <Input label="Email" type="email" defaultValue="john@gadgetwallet.com" />
                <Input label="Phone" defaultValue="+1 (555) 000-0000" />
                <Button variant="primary">Save Changes</Button>
              </div>
            </Card>
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-6">Account Overview</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 text-gw-text-secondary">
                  <User className="w-4 h-4 text-gw-accent" />
                  <span>Member since Jan 2024</span>
                </div>
                <div className="flex items-center gap-3 text-gw-text-secondary">
                  <Mail className="w-4 h-4 text-gw-accent" />
                  <span>john@gadgetwallet.com</span>
                </div>
                <div className="flex items-center gap-3 text-gw-text-secondary">
                  <MapPin className="w-4 h-4 text-gw-accent" />
                  <span>2 addresses</span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
