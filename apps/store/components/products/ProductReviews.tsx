'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, CheckCircle } from 'lucide-react';

interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  guestName?: string;
  isVerifiedPurchase?: boolean;
  createdAt: string;
  user?: { name: string };
}

interface Props {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={
              s <= (hovered || value)
                ? 'text-[var(--color-gold)] fill-[var(--color-gold)]'
                : 'text-gray-300 fill-gray-100'
            }
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-gray-500">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-4 text-right text-gray-500 font-medium">{star}</span>
      <Star size={10} className="text-[var(--color-gold)] fill-[var(--color-gold)] shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-gold)] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 text-gray-400">{count}</span>
    </div>
  );
}

export default function ProductReviews({ productId, averageRating, reviewCount }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/reviews/product/${productId}`)
      .then((r) => r.json())
      .then((j) => setReviews(j.data?.reviews ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { alert('Please select a star rating'); return; }
    if (!comment.trim()) { alert('Please write a comment'); return; }

    setSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/reviews/product/${productId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rating, title: title.trim() || undefined, comment: comment.trim(), guestName: guestName.trim() || undefined, guestEmail: guestEmail.trim() || undefined }),
      });

      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.message || 'Failed to submit');
      }

      setSubmitted(true);
      setShowForm(false);
      setRating(0); setTitle(''); setComment(''); setGuestName(''); setGuestEmail('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="reviews">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-2xl text-[var(--color-navy)]"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
        >
          Customer Reviews
        </h2>
        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-[var(--color-navy)] text-[var(--color-navy)] text-sm font-semibold rounded-full hover:bg-[var(--color-navy)] hover:text-white transition-all duration-200"
          >
            <MessageSquare size={14} />
            Write a Review
          </button>
        )}
      </div>

      {/* Aggregate rating */}
      {reviewCount > 0 && (
        <div className="flex gap-10 items-center mb-8 p-6 bg-[var(--color-cream)] rounded-2xl">
          <div className="text-center shrink-0">
            <p className="text-5xl font-bold text-[var(--color-navy)]">{averageRating.toFixed(1)}</p>
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={
                    s <= Math.round(averageRating)
                      ? 'text-[var(--color-gold)] fill-[var(--color-gold)]'
                      : 'text-gray-300 fill-gray-200'
                  }
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
          </div>
          <div className="flex-1 space-y-2">
            {dist.map((d) => (
              <RatingBar key={d.star} star={d.star} count={d.count} total={reviewCount} />
            ))}
          </div>
        </div>
      )}

      {/* Success message */}
      {submitted && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6 text-emerald-700">
          <CheckCircle size={18} />
          <div>
            <p className="font-semibold text-sm">Review submitted for approval!</p>
            <p className="text-xs mt-0.5">Your review will appear once approved by our team.</p>
          </div>
        </div>
      )}

      {/* Write a review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-200 rounded-2xl space-y-5 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--color-navy)]">Your Review</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rating *</label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Name</label>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Adnan Ahmed"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email (optional)</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Review Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Review *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this product..."
              rows={4}
              maxLength={1000}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{comment.length} / 1000</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[var(--color-navy)] text-white font-semibold text-sm rounded-full hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-1.5" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
          <Star size={32} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to share your experience</p>
          {!showForm && !submitted && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold text-sm rounded-full hover:bg-[var(--color-gold-dark)] transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((r) => {
            const reviewer = r.user?.name || r.guestName || 'Anonymous';
            const initials = reviewer.slice(0, 2).toUpperCase();
            return (
              <div key={r._id} className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: `hsl(${r._id.charCodeAt(0) * 17 % 360}, 50%, 40%)` }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= r.rating ? 'text-[var(--color-gold)] fill-[var(--color-gold)]' : 'text-gray-200 fill-gray-200'}
                        />
                      ))}
                    </div>
                    {r.title && (
                      <span className="font-semibold text-sm text-[var(--color-navy)]">{r.title}</span>
                    )}
                    {r.isVerifiedPurchase && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <ThumbsUp size={9} /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">{r.comment}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-medium text-gray-500">{reviewer}</span>
                    <span>·</span>
                    <span>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
