'use client';

import { Bell, Search } from 'lucide-react';

export default function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm shrink-0">
      {/* Search */}
      <div className="relative max-w-sm w-full">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search orders, products..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--color-gold)] focus:bg-white transition-all"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-500 hover:text-[var(--color-navy)] rounded-lg hover:bg-gray-50 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-gold)] rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-light)] flex items-center justify-center text-[var(--color-gold)] text-sm font-bold">
            A
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-[var(--color-navy)]">Admin</div>
            <div className="text-[10px] text-gray-400">MINARA</div>
          </div>
        </div>
      </div>
    </header>
  );
}
