import { Container } from "@gadget-wallet/ui";

export default function Privacy() {
  return (
    <section>
      <Container>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gw-black mb-6">Privacy Policy</h2>
          <div className="bg-white border border-gw-border rounded-[24px] p-8 text-gw-gray-500 leading-relaxed space-y-4">
            <p className="text-sm text-gw-gray-300">Last updated: January 2024</p>
            <h3 className="text-xl font-semibold text-gw-black">Information We Collect</h3>
            <p>We collect information you provide when creating an account, placing an order, or contacting our support team. This includes your name, email address, shipping address, and payment information.</p>
            <h3 className="text-xl font-semibold text-gw-black">How We Use Your Information</h3>
            <p>We use your information to process orders, provide customer support, send order updates, and improve our services. We do not sell your personal data to third parties.</p>
            <h3 className="text-xl font-semibold text-gw-black">Data Security</h3>
            <p>We implement industry-standard security measures including SSL encryption, secure data storage, and regular security audits to protect your personal information.</p>
            <h3 className="text-xl font-semibold text-gw-black">Contact</h3>
            <p>For privacy-related inquiries, please contact us at privacy@gadgetwallet.com.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
