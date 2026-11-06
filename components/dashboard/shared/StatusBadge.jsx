'use client';

import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Calendar,
  Sparkles,
  ShieldCheck,
  Eye,
  Check
} from 'lucide-react';

const STATUS_MAP = {
  // Booking & Service Request statuses
  submitted: { label: 'Requested', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Clock },
  requested: { label: 'Requested', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Clock },
  pending: { label: 'Requested', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Clock },
  new: { label: 'Requested', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Clock },
  uncontacted: { label: 'Requested', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Clock },
  contacted: { label: 'Contacted', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Check },
  connected: { label: 'Connected', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Check },
  quotation: { label: 'In Review', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: CheckCircle2 },
  quoted: { label: 'In Review', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: CheckCircle2 },
  accepted: { label: 'Accepted', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Check },
  confirmed: { label: 'Accepted', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Check },
  visit_confirmed: { label: 'Accepted', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Check },
  scheduled: { label: 'Scheduled', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Calendar },
  in_progress: { label: 'In Progress', color: '#749546', bg: '#f7f8f3', border: '#e6e8e1', icon: Clock },
  completed: { label: 'Completed', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: CheckCircle2 },
  closed: { label: 'Closed', color: '#475569', bg: '#f8fafc', border: '#cbd5e1', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: '#be123c', bg: '#fff1f2', border: '#fecdd3', icon: XCircle },
  rejected: { label: 'Declined', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', icon: XCircle },
  disputed: { label: 'Disputed', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', icon: AlertCircle },

  // Property & Project statuses
  approved: { label: 'Approved & Active', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: ShieldCheck },
  archived: { label: 'Archived', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', icon: Clock },
  active: { label: 'Active', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: CheckCircle2 },
  paused: { label: 'Paused', color: '#749546', bg: '#f7f8f3', border: '#e6e8e1', icon: Clock },

  // Lead stages
  interested: { label: 'Interested', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Sparkles },
  visit_scheduled: { label: 'Visit Set', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Calendar },
  negotiation: { label: 'Negotiation', color: '#749546', bg: '#f7f8f3', border: '#e6e8e1', icon: Clock },
  deal_closed: { label: 'Converted', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: CheckCircle2 },
  converted: { label: 'Converted', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: CheckCircle2 },

  // Project stages
  'New launch': { label: 'New Launch', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: Sparkles },
  'Under construction': { label: 'Under Construction', color: '#749546', bg: '#f7f8f3', border: '#e6e8e1', icon: Clock },
  'Ready to move': { label: 'Ready to Move', color: '#163e35', bg: '#ecf2e4', border: '#d6dcd3', icon: CheckCircle2 }
};

export default function StatusBadge({ status = 'pending', className = '' }) {
  const norm = String(status || '').toLowerCase().trim();
  const config = STATUS_MAP[norm] || STATUS_MAP[status] || {
    label: status ? String(status).charAt(0).toUpperCase() + String(status).slice(1) : 'Unknown',
    color: '#163e35',
    bg: '#ecf2e4',
    border: '#d6dcd3',
    icon: norm.includes('confirm') || norm.includes('accept') || norm.includes('done') || norm.includes('success') ? Check : Clock
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`
      }}
    >
      <Icon size={12} className="shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
