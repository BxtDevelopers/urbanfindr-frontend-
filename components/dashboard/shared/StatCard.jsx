'use client';

import Link from 'next/link';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  href,
  color = '#163e35',
  bgIcon = '#f0fdf4',
  onClick
}) {
  const CardContent = (
    <div className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 hover:shadow-sm transition-all duration-200 group relative flex flex-col justify-between h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {value}
          </div>
        </div>
        {Icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: bgIcon, color: color }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1.5 truncate">
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trend >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend >= 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span className="truncate">{subtitle || trendLabel}</span>
        </div>
        {href && (
          <ArrowUpRight
            size={14}
            className="text-stone-400 group-hover:text-stone-700 transition-colors shrink-0"
          />
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {CardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="text-left w-full h-full">
        {CardContent}
      </button>
    );
  }

  return CardContent;
}

