import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Container from '@/components/Container';

export const metadata: Metadata = { title: 'Contact', description: 'Visit, call or message Palash Telecom in Sirajganj, Bangladesh.' };

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <Container className="py-12">
          <h1 className="text-2xl font-semibold tracking-tight">Contact us</h1>
          <p className="mt-2 max-w-lg text-sm text-muted">
            Questions about a device, warranty or your order? Reach us any day, 10am–9pm.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-hairline bg-surface p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Showroom</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Palash Telecom<br />Station Road, Sirajganj 6700<br />Rajshahi Division, Bangladesh
              </p>
            </div>
            <div className="rounded-2xl border border-hairline bg-surface p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Talk to us</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>Phone / WhatsApp: <a href="tel:+8801700000000" className="text-accent hover:opacity-80">+880 1700-000000</a></li>
                <li>Email: <a href="mailto:hello@palashtelecom.com" className="text-accent hover:opacity-80">hello@palashtelecom.com</a></li>
                <li>Hours: 10:00–21:00, Sat–Thu</li>
              </ul>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
