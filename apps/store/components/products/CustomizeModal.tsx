'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ShoppingBag, Check } from 'lucide-react';

interface CustomField {
  label: string;
  placeholder?: string;
  required?: boolean;
}

interface Props {
  product: {
    _id: string;
    name: string;
    price: number;
    images: { url: string; alt?: string }[];
    customFields?: CustomField[];
  };
  quantity: number;
  onClose: () => void;
  onAdd: (customization: Record<string, string>) => void;
}

const DEFAULT_FIELDS: CustomField[] = [
  { label: 'Your Name', placeholder: 'e.g. Adnan', required: true },
];

export default function CustomizeModal({ product, quantity, onClose, onAdd }: Props) {
  const fields = product.customFields?.length ? product.customFields : DEFAULT_FIELDS;
  const [values, setValues] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const image = product.images?.[0];
  const previewText = values[fields[0]?.label] || '';

  const handleAdd = () => {
    for (const f of fields) {
      if (f.required && !values[f.label]?.trim()) {
        alert(`Please enter ${f.label}`);
        return;
      }
    }
    onAdd(values);
    setAdded(true);
    setTimeout(() => { onClose(); }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Left: Preview panel */}
      <div className="flex-1 bg-[#f5f1eb] flex flex-col items-center justify-center p-8 relative">
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: 'min(440px, 90%)', aspectRatio: '1' }}
        >
          {image?.url ? (
            <Image
              src={image.url}
              alt={product.name}
              fill
              sizes="440px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-[var(--color-cream)] flex items-center justify-center">
              <span className="text-7xl opacity-30">🎁</span>
            </div>
          )}

          {/* Text overlay preview */}
          {previewText && (
            <div className="absolute inset-0 flex items-end justify-center pb-8 px-4">
              <span
                className="text-center leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                style={{
                  fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                  fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                  color: '#fff',
                  textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                  maxWidth: '80%',
                  wordBreak: 'break-word',
                }}
              >
                {previewText}
              </span>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-400 font-medium tracking-wider uppercase">
          Preview · {previewText ? 'Your name on the product' : 'Enter your name to see preview'}
        </p>
      </div>

      {/* Right: Form panel */}
      <div className="w-full max-w-[400px] flex flex-col bg-white border-l border-gray-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-7 pb-0">
          <div>
            <h2
              className="text-2xl text-[var(--color-navy)] leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
            >
              Personalize Your Gift
            </h2>
            <p className="text-sm text-gray-400 mt-1 line-clamp-1">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors ml-4 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 p-7 space-y-5 overflow-y-auto">
          {fields.map((field) => (
            <div key={field.label}>
              <label className="block text-xs font-semibold text-[var(--color-navy)] uppercase tracking-wider mb-2">
                {field.label}
                {field.required && <span className="text-[var(--color-gold)] ml-1">*</span>}
              </label>
              <input
                value={values[field.label] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.label]: e.target.value }))}
                placeholder={field.placeholder || `Enter ${field.label}`}
                maxLength={40}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[rgba(207,169,106,0.15)] transition-all"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                {(values[field.label] || '').length} / 40 characters
              </p>
            </div>
          ))}

          <div className="bg-[var(--color-cream)] rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
            Your personalization will be hand-crafted and reviewed before delivery.
          </div>
        </div>

        {/* Footer */}
        <div className="p-7 pt-0 border-t border-gray-50">
          <p className="text-xs text-gray-400 mb-4 text-center">
            Qty: {quantity} · Customization included free
          </p>
          <button
            onClick={handleAdd}
            className={`w-full py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-dark)]'
            }`}
          >
            {added ? (
              <>
                <Check size={16} />
                Added to Cart!
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
