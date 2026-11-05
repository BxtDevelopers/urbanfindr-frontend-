'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export default function AnalyticsChart({
  title = 'Performance Trend',
  subtitle = 'Monthly views & interaction breakdown',
  data = [],
  dataKeys = [{ key: 'views', name: 'Views', color: '#163e35' }],
  type = 'area',
  height = 240
}) {
  const [filterPeriod, setFilterPeriod] = useState('6m');

  const defaultSampleData = [
    { name: 'May', views: 42, enquiries: 8, visits: 3 },
    { name: 'Jun', views: 78, enquiries: 14, visits: 6 },
    { name: 'Jul', views: 110, enquiries: 22, visits: 9 },
    { name: 'Aug', views: 145, enquiries: 31, visits: 14 },
    { name: 'Sep', views: 190, enquiries: 38, visits: 18 },
    { name: 'Oct', views: 240, enquiries: 46, visits: 24 }
  ];

  const chartData = data && data.length > 0 ? data : defaultSampleData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-stone-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg border border-stone-800 space-y-1">
          <p className="font-semibold text-stone-300">{label}</p>
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-stone-300">{item.name}:</span>
              </span>
              <span className="font-bold">{item.value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-bold text-stone-900 text-base">{title}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
          {['30d', '3m', '6m', '1y'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPeriod(p)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterPeriod === p
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              {dataKeys.map((k) => (
                <Bar
                  key={k.key}
                  dataKey={k.key}
                  name={k.name}
                  fill={k.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              ))}
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {dataKeys.map((k) => (
                  <linearGradient key={`grad-${k.key}`} id={`grad-${k.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={k.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={k.color} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              {dataKeys.map((k) => (
                <Area
                  key={k.key}
                  type="monotone"
                  dataKey={k.key}
                  name={k.name}
                  stroke={k.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#grad-${k.key})`}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

