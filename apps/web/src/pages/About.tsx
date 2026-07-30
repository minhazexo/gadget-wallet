import { Container, Card } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Shield, Users, Globe, Award } from "lucide-react";

export default function About() {
  return (
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-display font-bold mb-4">About Gadget Wallet</h1>
            <p className="text-gw-text-secondary text-lg leading-relaxed">
              We are a premium electronics retailer dedicated to bringing you the latest and greatest 
              in technology. Our mission is to make cutting-edge gadgets accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Shield, title: "Trusted Quality", desc: "All products are verified authentic" },
              { icon: Users, title: "Expert Support", desc: "24/7 customer service team" },
              { icon: Globe, title: "Global Shipping", desc: "Worldwide delivery available" },
              { icon: Award, title: "Best Prices", desc: "Price match guarantee" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card glass className="p-6 text-center">
                  <item.icon className="w-10 h-10 text-gw-accent mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gw-text-secondary">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-display font-bold mb-4">Our Story</h2>
            <div className="space-y-4 text-gw-text-secondary leading-relaxed">
              <p>Founded in 2024, Gadget Wallet started with a simple vision: to create the ultimate destination for premium electronics. We partner directly with leading brands like Apple, Samsung, Sony, and more to bring you authentic products at competitive prices.</p>
              <p>Our team of tech enthusiasts carefully curates every product in our collection, ensuring that only the best gadgets make it to your doorstep. We believe that technology should enhance your life, and we're here to help you find the perfect device.</p>
              <p>From smartphones and laptops to smartwatches and gaming gear, Gadget Wallet is your trusted partner in the world of technology.</p>
            </div>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
