import { Container, Button, Input } from "@gadget-wallet/ui";
import { User, Mail, MapPin, Package } from "lucide-react";

export default function Profile() {
  return (
    <section>
      <Container>
        <h2 className="text-3xl font-bold text-gw-black mb-8">My Profile</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border border-gw-border rounded-[24px] p-6">
              <h3 className="text-lg font-semibold text-gw-black mb-6">Personal Information</h3>
              <div className="space-y-4 max-w-lg">
                <Input label="Full Name" defaultValue="John Doe" />
                <Input label="Email" type="email" defaultValue="john@gadgetwallet.com" />
                <Input label="Phone" defaultValue="+1 (555) 000-0000" />
                <Button variant="primary" className="h-12">Save Changes</Button>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white border border-gw-border rounded-[24px] p-6 sticky top-[148px]">
              <h3 className="text-lg font-semibold text-gw-black mb-6">Account Overview</h3>
              <div className="space-y-4 text-sm">
                {[
                  { icon: User, text: "Member since Jan 2024" },
                  { icon: Mail, text: "john@gadgetwallet.com" },
                  { icon: MapPin, text: "2 addresses" },
                  { icon: Package, text: "5 orders placed" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-gw-gray-500">
                    <div className="w-8 h-8 rounded-full bg-gw-red/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-gw-red" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
