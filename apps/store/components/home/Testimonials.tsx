'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The packaging was absolutely stunning. My client was blown away by the corporate hamper. MINARA has become our go-to for gifting.',
    role: 'Marketing Director',
  },
  {
    name: 'Rahul Mehta',
    location: 'Delhi',
    rating: 5,
    text: 'Ordered a birthday hamper for my wife and she was in tears — the good kind! Every product was premium and the box was gorgeous.',
    role: 'Entrepreneur',
  },
  {
    name: 'Ananya Iyer',
    location: 'Bangalore',
    rating: 5,
    text: 'Fast delivery, beautiful presentation, and the quality of products was exceptional. Will definitely order again for Diwali!',
    role: 'Product Manager',
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 bg-gradient-navy">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-6 h-[1px] bg-[var(--color-gold)]" />
            <span className="text-[var(--color-gold)] text-xs tracking-[3px] uppercase font-medium">
              What Our Customers Say
            </span>
            <div className="w-6 h-[1px] bg-[var(--color-gold)]" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-white">
            Love From Our Gifters
          </h2>
        </motion.div>

        {/* Testimonial card */}
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(testimonials[active].rating)].map((_, i) => (
              <Star key={i} size={18} className="text-[var(--color-gold)] fill-[var(--color-gold)]" />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="font-heading text-xl md:text-2xl text-white/90 italic leading-relaxed mb-8">
            &ldquo;{testimonials[active].text}&rdquo;
          </blockquote>

          {/* Author */}
          <div>
            <div className="font-semibold text-[var(--color-gold)]">{testimonials[active].name}</div>
            <div className="text-white/40 text-sm mt-1">
              {testimonials[active].role} · {testimonials[active].location}
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <button
            onClick={() => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="p-2 rounded-full border border-[rgba(207,169,106,0.3)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === active ? 'bg-[var(--color-gold)] w-6' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setActive((prev) => (prev + 1) % testimonials.length)}
            className="p-2 rounded-full border border-[rgba(207,169,106,0.3)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
