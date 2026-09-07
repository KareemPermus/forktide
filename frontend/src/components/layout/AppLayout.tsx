import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, BookOpen, ShoppingCart, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  { label: 'Recipes', href: '/recipes', icon: BookOpen },
  { label: 'Grocery List', href: '/grocery-list', icon: ShoppingCart },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/' || router.pathname === '/home';
    return router.pathname.startsWith(href);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#faf8f3] text-stone-800 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static z-50 w-60 h-screen flex flex-col border-r border-stone-200 bg-white
        transition-transform lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-6 py-5 flex items-center gap-2 border-b border-stone-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            F
          </div>
          <span className="font-display text-xl text-stone-900">Forktide</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-stone-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 font-semibold text-sm">
              U
            </div>
            <div className="text-sm leading-tight">
              <div className="font-medium text-stone-800">Guest User</div>
              <div className="text-stone-400 text-xs">Meal Planner</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-[#faf8f3]/90 backdrop-blur px-4 md:px-8 py-4 flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-stone-600" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {/* placeholder for page-specific header actions */}
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
        <footer className="pt-2 pb-6 text-center text-xs text-stone-400">
          Forktide · Plan smarter, eat better.
        </footer>
      </main>
    </div>
  );
}