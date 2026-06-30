'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  TicketPercent,
  Star,
  Image,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/products', icon: Package, label: 'Products' },
  { href: '/dashboard/categories', icon: Tag, label: 'Categories' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/dashboard/customers', icon: Users, label: 'Customers' },
  { href: '/dashboard/coupons', icon: TicketPercent, label: 'Coupons' },
  { href: '/dashboard/reviews', icon: Star, label: 'Reviews' },
  { href: '/dashboard/banners', icon: Image, label: 'Banners' },
  { href: '/dashboard/pages', icon: FileText, label: 'Pages' },
  { href: '/dashboard/faqs', icon: HelpCircle, label: 'FAQs' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`relative h-screen flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      style={{ background: 'var(--color-sidebar-bg)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[rgba(207,169,106,0.1)]">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="MINARA Logo" className="h-9 w-auto rounded object-contain" />
            <div>
              <div className="font-heading text-lg text-[var(--color-gold)] tracking-[2px] leading-none">MINARA</div>
              <div className="text-[9px] text-white/40 tracking-wider uppercase">Admin</div>
            </div>
          </div>
        ) : (
          <img src="/logo.jpg" alt="MINARA Logo" className="h-8 w-auto rounded object-contain mx-auto" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-[rgba(207,169,106,0.1)]">
        <button
          onClick={() => {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
          }}
          className={`sidebar-link w-full hover:text-red-400 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
