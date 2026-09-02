import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  accentClass?: string;
}

export default function KpiCard({ label, value, suffix, icon, accentClass = 'bg-emerald-100 text-emerald-600' }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between">
      <div>
        <p className="text-stone-400 text-xs font-medium">{label}</p>
        <p className="text-2xl font-extrabold mt-1">
          {value}
          {suffix && <span className="text-sm font-medium text-stone-400"> {suffix}</span>}
        </p>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentClass}`}>
        {icon}
      </div>
    </div>
  );
}