'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, Filter, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewsApi, type Review } from '@/lib/adminApi';

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={11} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [ratingFilter, setRatingFilter] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '100' };
      if (status !== 'all') params.status = status;
      if (ratingFilter) params.rating = ratingFilter;
      const res = await reviewsApi.getAll(params);
      setReviews(res.data.reviews);
      setTotal(res.pagination?.total ?? res.data.reviews.length);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [status, ratingFilter]);

  const handleApprove = async (id: string, approve: boolean) => {
    setActing(id);
    try {
      await reviewsApi.update(id, { isApproved: approve });
      setReviews((prev) => prev.map((r) => r._id === id ? { ...r, isApproved: approve } : r));
      toast.success(approve ? 'Review approved' : 'Review rejected');
    } catch { toast.error('Failed to update review'); }
    finally { setActing(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    setActing(id);
    try {
      await reviewsApi.delete(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setActing(null); }
  };

  const pending = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total — {pending} pending approval</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-700">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            {pending} pending
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filters:</span>
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                  status === s
                    ? 'bg-[var(--color-navy)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="admin-input w-auto py-1.5 text-sm"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={String(r)}>{r} Stars</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)
        ) : reviews.length === 0 ? (
          <div className="admin-card text-center py-16 text-gray-400">No reviews found</div>
        ) : (
          reviews.map((r) => {
            const reviewer = r.user?.name || r.guestName || 'Anonymous';
            const email = r.user?.email || r.guestEmail || '';
            return (
              <div
                key={r._id}
                className={`admin-card border-l-4 ${r.isApproved ? 'border-l-emerald-400' : 'border-l-amber-400'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <StarRow rating={r.rating} />
                      {r.title && (
                        <span className="font-semibold text-sm text-[var(--color-navy)]">{r.title}</span>
                      )}
                      <span className={`status-badge text-[10px] ${r.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {r.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      {r.isVerifiedPurchase && (
                        <span className="status-badge text-[10px] bg-blue-100 text-blue-700">Verified Purchase</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{r.comment}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="font-medium text-gray-600">{reviewer}</span>
                      {email && <span>{email}</span>}
                      {r.product && (
                        <span className="text-[var(--color-gold-dark)] font-medium">
                          on: {r.product.name}
                        </span>
                      )}
                      <span>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {acting === r._id ? (
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    ) : (
                      <>
                        {!r.isApproved ? (
                          <button
                            onClick={() => handleApprove(r._id, true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApprove(r._id, false)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
