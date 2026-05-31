// Trust signals — the conversion backbone for used phones. Pure server HTML.
import Container from '@/components/Container';

const FEATURES = [
  { t: 'Tested & graded', d: '40-point check on every device' },
  { t: 'Warranty included', d: 'Up to 3 months service warranty' },
  { t: 'bKash · Nagad · COD', d: 'Pay online or cash on delivery' },
  { t: 'Delivery across BD', d: 'Dispatched from Sirajganj' },
];

export default function FeatureStrip() {
  return (
    <section className="border-y border-hairline bg-soft">
      <Container className="grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.t} className="bg-soft px-2 py-6 text-center">
            <p className="text-sm font-semibold tracking-tight">{f.t}</p>
            <p className="mt-1 text-xs text-muted">{f.d}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
