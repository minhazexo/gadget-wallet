import { Container, Card } from "@gadget-wallet/ui";

export default function Privacy() {
  return (
    <section className="gw-section">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gw-black mb-6">Privacy Policy</h1>
          <Card className="p-8 text-gw-gray-500 leading-relaxed space-y-4">
            <p>Last updated: January 2024</p>
            <h2 className="text-xl font-semibold text-gw-black">Information We Collect</h2>
            <p>We collect information you provide when creating an account, placing an order, or contacting our support team. This includes your name, email address, shipping address, and payment information.</p>
            <h2 className="text-xl font-semibold text-gw-black">How We Use Your Information</h2>
            <p>We use your information to process orders, provide customer support, send order updates, and improve our services. We do not sell your personal data to third parties.</p>
            <h2 className="text-xl font-semibold text-gw-black">Data Security</h2>
            <p>We implement industry-standard security measures including SSL encryption, secure data storage, and regular security audits to protect your personal information.</p>
            <h2 className="text-xl font-semibold text-gw-black">Contact</h2>
            <p>For privacy-related inquiries, please contact us at privacy@gadgetwallet.com.</p>
          </Card>
        </div>
      </Container>
    </section>
  );
}
