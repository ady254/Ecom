'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Star, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@minara/utils';
import { productsAdminApi, type AdminProduct } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await productsAdminApi.getAll({ limit: '50' });
      setProducts(res.data.products);
      setTotal(res.pagination?.total ?? res.data.products.length);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await productsAdminApi.delete(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Products</h1>
          {!loading && <p className="text-sm text-gray-500 mt-0.5">{total} total products</p>}
        </div>
        <Link href="/dashboard/products/new" className="btn-admin-gold">
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      <div className="admin-card">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products…"
            className="admin-input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-card overflow-hidden p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pl-6">Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th className="pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const img = product.images?.[0]?.url;
                  return (
                    <tr key={product._id}>
                      <td className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--color-cream)] overflow-hidden shrink-0 relative">
                            {img ? (
                              <Image src={img} alt={product.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">🎁</div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-[var(--color-navy)]">{product.name}</div>
                            {product.isFeatured && (
                              <span className="text-[10px] text-[var(--color-gold-dark)] font-medium">✦ Featured</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-gray-500">{product.category?.name ?? '—'}</td>
                      <td className="font-semibold text-[var(--color-navy)]">{formatCurrency(product.price)}</td>
                      <td>
                        <span className={`text-sm font-medium ${
                          product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-orange-500' : 'text-emerald-600'
                        }`}>
                          {product.stock === 0 ? 'Out of stock' : `${product.stock} units`}
                        </span>
                      </td>
                      <td>
                        {product.ratings ? (
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-[var(--color-gold)] fill-[var(--color-gold)]" />
                            <span className="text-sm">{product.ratings.averageRating} ({product.ratings.reviewCount})</span>
                          </div>
                        ) : <span className="text-gray-400 text-sm">—</span>}
                      </td>
                      <td>
                        <span className={`status-badge ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="pr-6">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/products/${product._id}`}
                            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-[var(--color-navy)] transition-colors"
                          >
                            <Edit size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            disabled={deleting === product._id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle size={24} className="opacity-30" />
                        <p>{search ? 'No products match your search' : 'No products yet — add your first one'}</p>
                        {!search && (
                          <Link href="/dashboard/products/new" className="btn-admin-gold mt-2 text-sm">
                            <Plus size={14} /> Add Product
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
