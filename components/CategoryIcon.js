'use client';

import {
  Home,
  Armchair,
  Sprout,
  Scale,
  Zap,
  AirVent,
  Bug,
  Waves,
  Cylinder,
  BatteryCharging,
  ArrowUpDown,
  Briefcase,
  Building2,
  Sparkles,
} from 'lucide-react';

const ICON_MAP = {
  Home,
  Armchair,
  Sprout,
  Scale,
  Zap,
  AirVent,
  Bug,
  Waves,
  Cylinder,
  BatteryCharging,
  ArrowUpDown,
  Briefcase,
  Building2,
};

export default function CategoryIcon({ name, size = 20, className = '' }) {
  const IconComponent = ICON_MAP[name] || Sparkles;
  return <IconComponent size={size} className={className} />;
}
