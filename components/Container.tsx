export default function Container({
  children, className = '',
}: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-content px-4 sm:px-6 ${className}`}>{children}</div>;
}
