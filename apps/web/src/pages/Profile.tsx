import { Container, Card, Input, Button } from "@gadget-wallet/ui";
import { User, Mail, MapPin } from "lucide-react";

export default function Profile() {
  return (
    <section>
      <Container>
        <h2 className="text-3xl font-bold text-gw-black mb-8">My Profile</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-6">
            <h3 className="font-semibold text-lg text-gw-black mb-6">Personal Information</h3>
            <div className="space-y-4">
              <Input label="Full Name" defaultValue="John Doe" />
              <Input label="Email" type="email" defaultValue="john@gadgetwallet.com" />
              <Input label="Phone" defaultValue="+1 (555) 000-0000" />
              <Button variant="primary">Save Changes</Button>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-lg text-gw-black mb-6">Account Overview</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-gw-gray-500">
                <User className="w-4 h-4 text-gw-red" />
                <span>Member since Jan 2024</span>
              </div>
              <div className="flex items-center gap-3 text-gw-gray-500">
                <Mail className="w-4 h-4 text-gw-red" />
                <span>john@gadgetwallet.com</span>
              </div>
              <div className="flex items-center gap-3 text-gw-gray-500">
                <MapPin className="w-4 h-4 text-gw-red" />
                <span>2 addresses</span>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
