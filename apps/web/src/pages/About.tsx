import { Container, Card } from "@gadget-wallet/ui";
import { Shield, Users, Globe, Award } from "lucide-react";

export default function About() {
  return (
    <section className="gw-section">
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="gw-page-title-lg">About Gadget Wallet</h1>
          <p className="gw-page-subtitle-lg">
            We are a premium electronics retailer dedicated to bringing you the latest and greatest
            in technology. Our mission is to make cutting-edge gadgets accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {[
            { icon: Shield, title: "Trusted Quality", desc: "All products are verified authentic" },
            { icon: Users, title: "Expert Support", desc: "24/7 customer service team" },
            { icon: Globe, title: "Global Shipping", desc: "Worldwide delivery available" },
            { icon: Award, title: "Best Prices", desc: "Price match guarantee" },
          ].map((item) => (
            <div key={item.title} className="gw-panel-light p-6 text-center">
              <item.icon className="w-10 h-10 text-gw-red mx-auto mb-4" />
              <h3 className="font-semibold text-gw-black mb-2">{item.title}</h3>
              <p className="text-sm text-gw-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <Card className="p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gw-black mb-4">Our Story</h2>
          <div className="space-y-4 text-gw-gray-500 leading-relaxed">
            <p>Founded in 2024, Gadget Wallet started with a simple vision: to create the ultimate destination for premium electronics. We partner directly with leading brands like Apple, Samsung, Sony, and more to bring you authentic products at competitive prices.</p>
            <p>Our team of tech enthusiasts carefully curates every product in our collection, ensuring that only the best gadgets make it to your doorstep. We believe that technology should enhance your life, and we're here to help you find the perfect device.</p>
            <p>From smartphones and laptops to smartwatches and gaming gear, Gadget Wallet is your trusted partner in the world of technology.</p>
          </div>
        </Card>
      </Container>
    </section>
  );
}
