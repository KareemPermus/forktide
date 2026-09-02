import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiBookOpen, FiShoppingCart, FiHome, FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { label: 'Home', href: '/home', icon: FiHome },
  { label: 'Recipes', href: '/recipes', icon: FiBookOpen },
  { label: 'Grocery List', href: '/grocery-list', icon: FiShoppingCart },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => router.pathname.startsWith(href);

  return (
    <div className="h-screen flex bg-stone-50 text-stone-800 overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static z-50 h-screen w-60 flex flex-col bg-white border-r border-stone-200 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5 flex items-center gap-2 border-b border-stone-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-extrabold text-lg tracking-tight">Forktide</span>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}>
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                isActive(item.href)
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
              onClick={() => setOpen(false)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-stone-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">U</div>
            <div className="text-sm">
              <p className="font-semibold leading-tight">Home Chef</p>
              <p className="text-stone-400 text-xs">Meal Planner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="lg:hidden px-4 py-3 border-b border-stone-200 bg-white flex items-center gap-3">
          <button onClick={() => setOpen(true)}>
            <FiMenu className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-lg">Forktide</span>
        </div>
        <div className="p-6 md:p-8">
          {children}
        </div>
        <footer className="px-6 md:px-8 pb-6 pt-4 border-t border-stone-200 text-xs text-stone-400 flex justify-between">
          <span>© 2025 Forktide</span>
          <span>Plan smarter. Eat better.</span>
        </footer>
      </main>
    </div>
  );
}