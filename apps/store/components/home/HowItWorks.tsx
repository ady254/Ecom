const steps = [
  {
    num: '01',
    title: 'Browse & Pick',
    desc: 'Explore 500+ handpicked gifts across 8 occasions. Filter by price, category, or recipient.',
    icon: '🔍',
  },
  {
    num: '02',
    title: 'Place Your Order',
    desc: 'Pay securely via UPI, cards, or cash on delivery. Your order is confirmed instantly.',
    icon: '🛒',
  },
  {
    num: '03',
    title: 'We Pack & Ship',
    desc: 'Your gift is beautifully wrapped and dispatched within 24 hours. Delivered pan-India.',
    icon: '📦',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-14 bg-[var(--color-navy)]">
      <div className="section-container">
        <div className="text-center mb-10">
          <p className="text-[var(--color-gold)] text-xs font-semibold tracking-[3px] uppercase mb-2">
            Simple. Reliable. Beautiful.
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-white">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-8 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-0.5 bg-[rgba(207,169,106,0.2)]" />

          {steps.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              {/* Step number bubble */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-[var(--color-gold)]/10 border-2 border-[var(--color-gold)]/30 flex flex-col items-center justify-center mb-5">
                <span className="text-2xl">{step.icon}</span>
              </div>

              <span className="text-[var(--color-gold)] text-xs font-bold tracking-widest uppercase mb-2">
                Step {step.num}
              </span>
              <h3 className="font-heading text-xl text-white mb-2">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">{step.desc}</p>

              {/* Mobile connector */}
              {i < steps.length - 1 && (
                <div className="md:hidden w-0.5 h-8 bg-[rgba(207,169,106,0.3)] mt-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
