export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center px-4 py-16">
      {children}
    </div>
  );
}
