import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
}

export default function KpiCard({ label, value, subtitle, icon: Icon, accentColor = 'text-emerald-600' }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-100">
      <div className="flex items-center gap-2 text-stone-500 text-sm">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="mt-2 font-display text-3xl text-stone-900">{value}</div>
      {subtitle && <div className={`text-xs mt-1 ${accentColor}`}>{subtitle}</div>}
    </div>
  );
}