import Link from 'next/link';
import Container from '@/components/Container';

const COLS = [
  { h: 'Shop', links: [['/phones', 'Phones'], ['/accessories', 'Accessories'], ['/deals', 'Deals']] },
  { h: 'Company', links: [['/contact', 'Contact'], ['/about', 'About us'], ['/warranty', 'Warranty policy']] },
  { h: 'Support', links: [['/contact', 'Help & returns'], ['/track', 'Track order'], ['/faq', 'FAQ']] },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-soft">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-base font-semibold tracking-tight">
              Palash<span className="text-accent"> Telecom</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Certified pre-owned phones &amp; accessories. Tested, graded and warrantied —
              shipped across Bangladesh from Sirajganj.
            </p>
            <p className="mt-4 text-sm text-muted">
              Station Road, Sirajganj 6700<br />
              <a href="tel:+8801700000000" className="hover:text-ink">+880 1700-000000</a><br />
              <a href="mailto:hello@palashtelecom.com" className="hover:text-ink">hello@palashtelecom.com</a>
            </p>
          </div>
          {COLS.map((c) => (
            <nav key={c.h}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{c.h}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {c.links.map(([href, label]) => (
                  <li key={label}>
                    <Link href={href} prefetch={false} className="text-muted transition-colors hover:text-ink">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-hairline pt-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Palash Telecom · Sirajganj, Bangladesh</p>
          <div className="flex items-center gap-2 text-xs">
            {['bKash', 'Nagad', 'Visa', 'Mastercard', 'COD'].map((m) => (
              <span key={m} className="rounded-md border border-hairline bg-surface px-2 py-1">{m}</span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
