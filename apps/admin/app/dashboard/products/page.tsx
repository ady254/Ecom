'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Star } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@minara/utils';

const demoProducts = [
  { _id: '1', name: 'Royal Saffron Gift Box', category: 'Gift Hampers', price: 2499, stock: 24, isActive: true, isFeatured: true, averageRating: 4.9, reviewCount: 128 },
  { _id: '2', name: 'Artisan Chocolate Hamper', category: 'Gift Hampers', price: 1899, stock: 15, isActive: true, isFeatured: false, averageRating: 4.8, reviewCount: 96 },
  { _id: '3', name: 'Wellness Ritual Set', category: 'Self-Care', price: 3299, stock: 8, isActive: true, isFeatured: true, averageRating: 5.0, reviewCount: 64 },
  { _id: '4', name: 'Luxury Tea Collection', category: 'Food & Beverage', price: 1599, stock: 0, isActive: false, isFeatured: false, averageRating: 4.7, reviewCount: 203 },
];

export default function ProductsAdminPage() {
  const [search, setSearch] = useState('');

  const filtered = demoProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Products</h1>
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
            placeholder="Search products..."
            className="admin-input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-card overflow-hidden p-0">
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
              {filtered.map((product) => (
                <tr key={product._id}>
                  <td className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-cream)] flex items-center justify-center text-lg shrink-0">
                        🎁
                      </div>
                      <div>
                        <div className="font-medium text-sm text-[var(--color-navy)]">{product.name}</div>
                        {product.isFeatured && (
                          <span className="text-[10px] text-[var(--color-gold-dark)] font-medium">✦ Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-gray-500">{product.category}</td>
                  <td className="font-semibold text-[var(--color-navy)]">{formatCurrency(product.price)}</td>
                  <td>
                    <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-orange-500' : 'text-emerald-600'}`}>
                      {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-[var(--color-gold)] fill-[var(--color-gold)]" />
                      <span className="text-sm">{product.averageRating} ({product.reviewCount})</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="pr-6">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/products/${product._id}`} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-[var(--color-navy)] transition-colors">
                        <Edit size={15} />
                      </Link>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
