'use client';

// High-fidelity, vibrant colored category icons matching the design mockup
export default function CategoryIcon({ name, size = 26, className = '' }) {
  switch (name) {
    case 'Home':
    case 'Properties':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* House Roof & Body */}
          <path
            d="M16 4L4 14.5h3.5V27a1.5 1.5 0 001.5 1.5h14a1.5 1.5 0 001.5-1.5V14.5H28L16 4z"
            fill="#10b981"
            fillOpacity="0.16"
          />
          <path
            d="M16 4.2L4 14.5h3.5V27a1 1 0 001 1h15a1 1 0 001-1V14.5H28L16 4.2z"
            stroke="#059669"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Door */}
          <path
            d="M13 28v-9a1 1 0 011-1h4a1 1 0 011 1v9"
            fill="#059669"
            fillOpacity="0.25"
            stroke="#059669"
            strokeWidth="2"
          />
          {/* Window */}
          <circle cx="16" cy="11.5" r="2.2" fill="#10b981" />
        </svg>
      );

    case 'Armchair':
    case 'Interior Designers':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sofa Backrest */}
          <path
            d="M7 11a3 3 0 013-3h12a3 3 0 013 3v8H7v-8z"
            fill="#f43f5e"
            fillOpacity="0.2"
            stroke="#e11d48"
            strokeWidth="2"
          />
          {/* Left Armrest */}
          <rect
            x="4"
            y="13"
            width="5"
            height="10"
            rx="2.5"
            fill="#e11d48"
            stroke="#be123c"
            strokeWidth="1.5"
          />
          {/* Right Armrest */}
          <rect
            x="23"
            y="13"
            width="5"
            height="10"
            rx="2.5"
            fill="#e11d48"
            stroke="#be123c"
            strokeWidth="1.5"
          />
          {/* Cushion Seat */}
          <rect
            x="8"
            y="16"
            width="16"
            height="7"
            rx="2"
            fill="#fda4af"
            stroke="#e11d48"
            strokeWidth="1.8"
          />
          {/* Wooden Legs */}
          <path
            d="M7 23l-2 5M25 23l2 5"
            stroke="#881337"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'Sprout':
    case 'Landscapers':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Leaf */}
          <path
            d="M27 6c-8 0-14 5-14 13a7 7 0 007 7c8 0 13-6 13-14V6h-6z"
            fill="#22c55e"
            fillOpacity="0.25"
            stroke="#16a34a"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Leaf Vein */}
          <path
            d="M13 19c4-2 9-5 14-13"
            stroke="#15803d"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Small Secondary Sprout Leaf */}
          <path
            d="M14 17c-3-3-8-4-9-4 0 4 2 8 6 9 1-2 2-3 3-5z"
            fill="#4ade80"
            stroke="#16a34a"
            strokeWidth="1.8"
          />
          {/* Stem into Ground */}
          <path
            d="M13 19v8"
            stroke="#15803d"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'Scale':
    case 'Lawyers':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Center Pillar */}
          <path d="M16 5v21M11 26h10M16 5h.01" stroke="#1e40af" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="16" cy="5" r="2" fill="#3b82f6" />
          {/* Beam */}
          <path d="M7 10h18" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" />
          {/* Left Pan */}
          <path d="M7 10l-3 7h6l-3-7z" fill="#93c5fd" fillOpacity="0.4" stroke="#2563eb" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M4 17a3 3 0 006 0" fill="#2563eb" />
          {/* Right Pan */}
          <path d="M25 10l-3 7h6l-3-7z" fill="#93c5fd" fillOpacity="0.4" stroke="#2563eb" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M22 17a3 3 0 006 0" fill="#2563eb" />
        </svg>
      );

    case 'Zap':
    case 'Electricians':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Glow backdrop */}
          <path
            d="M18 3L6 17h8l-2 12 14-15h-9l3-11z"
            fill="#fef08a"
            fillOpacity="0.6"
          />
          {/* Lightning Flash */}
          <path
            d="M18 3L6 17h8l-2 12 14-15h-9l3-11z"
            fill="#eab308"
            stroke="#ca8a04"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'AirVent':
    case 'AC Technicians':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* AC Unit Body */}
          <rect
            x="4"
            y="7"
            width="24"
            height="13"
            rx="2.5"
            fill="#e0f2fe"
            stroke="#0284c7"
            strokeWidth="2"
          />
          {/* Display & Grill */}
          <path d="M7 15h18" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="23" cy="11" r="1.3" fill="#0284c7" />
          {/* Cool Airflow Breeze */}
          <path
            d="M7 23c2 2 4 1 6 3M13 23c2 2 4 1 6 3M19 23c2 2 4 1 6 3"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'Bug':
    case 'Pest Control':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bug Body */}
          <ellipse
            cx="16"
            cy="17"
            rx="6"
            ry="7.5"
            fill="#475569"
            fillOpacity="0.2"
            stroke="#334155"
            strokeWidth="2.2"
          />
          {/* Bug Head */}
          <path
            d="M12 11a4 4 0 018 0"
            fill="#334155"
            stroke="#334155"
            strokeWidth="1.8"
          />
          {/* Antennae */}
          <path
            d="M13 9L9 5M19 9l4-4"
            stroke="#dc2626"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Legs */}
          <path
            d="M10 14L4 12M22 14l6-2M10 18H3M22 18h7M10 22l-5 3M22 22l5 3"
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Target / Protection Mark */}
          <circle cx="16" cy="17" r="2" fill="#ef4444" />
        </svg>
      );

    case 'Waves':
    case 'Pool Cleaning':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Water Waves */}
          <path
            d="M4 11c3-2 5 2 8 0s5-2 8 0 5 2 8 0"
            stroke="#0891b2"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M4 17c3-2 5 2 8 0s5-2 8 0 5 2 8 0"
            stroke="#06b6d4"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M4 23c3-2 5 2 8 0s5-2 8 0 5 2 8 0"
            stroke="#22d3ee"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Fresh Sparkle */}
          <circle cx="23" cy="6" r="1.8" fill="#06b6d4" />
          <path d="M23 3v2M23 7v2M20 6h2M24 6h2" stroke="#0891b2" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case 'Cylinder':
    case 'Tank Cleaning':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tank Body */}
          <rect
            x="8"
            y="8"
            width="16"
            height="18"
            rx="3"
            fill="#dbeafe"
            stroke="#2563eb"
            strokeWidth="2"
          />
          {/* Ribs / Water Rings */}
          <path d="M8 14h16M8 20h16" stroke="#3b82f6" strokeWidth="1.6" strokeDasharray="3 2" />
          {/* Top Cap */}
          <rect
            x="12"
            y="5"
            width="8"
            height="3.5"
            rx="1.5"
            fill="#1d4ed8"
          />
          {/* Water Droplet */}
          <path
            d="M16 11c-1.5 2-2 3.5-2 4.5a2 2 0 004 0c0-1-.5-2.5-2-4.5z"
            fill="#3b82f6"
          />
        </svg>
      );

    case 'BatteryCharging':
    case 'Inverter Maintenance':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Inverter Box Body */}
          <rect
            x="5"
            y="9"
            width="22"
            height="17"
            rx="2.5"
            fill="#ecfdf5"
            stroke="#059669"
            strokeWidth="2"
          />
          {/* Positive & Negative Terminals */}
          <rect x="9" y="5.5" width="4" height="3.5" rx="1" fill="#dc2626" />
          <rect x="19" y="5.5" width="4" height="3.5" rx="1" fill="#1e293b" />
          {/* Power Bolt Center */}
          <path
            d="M17 12l-4 6h4l-2 6 6-7h-4l2-5z"
            fill="#10b981"
            stroke="#047857"
            strokeWidth="1.2"
          />
        </svg>
      );

    case 'ArrowUpDown':
    case 'Lift Maintenance':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Elevator Frame */}
          <rect
            x="6"
            y="4"
            width="20"
            height="24"
            rx="3"
            fill="#eff6ff"
            stroke="#1d4ed8"
            strokeWidth="2"
          />
          {/* Center Door Slit */}
          <path d="M16 5v22" stroke="#93c5fd" strokeWidth="1.5" />
          {/* Up Green Arrow */}
          <path
            d="M11 15V9m0 0l-2.5 2.5M11 9l2.5 2.5"
            stroke="#16a34a"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Down Red Arrow */}
          <path
            d="M21 17v6m0 0l-2.5-2.5M21 23l2.5-2.5"
            stroke="#dc2626"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'Briefcase':
    case 'Office Supplies':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chair / Desk Supplies - Sleek Ergonomic Chair */}
          {/* Backrest */}
          <rect
            x="11"
            y="4"
            width="10"
            height="11"
            rx="3"
            fill="#0284c7"
            stroke="#0369a1"
            strokeWidth="1.8"
          />
          {/* Seat */}
          <rect
            x="8"
            y="15"
            width="16"
            height="4"
            rx="2"
            fill="#38bdf8"
            stroke="#0284c7"
            strokeWidth="1.8"
          />
          {/* Stem & Wheels */}
          <path d="M16 19v6M11 28l5-3 5 3" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10.5" cy="28.5" r="1.3" fill="#1e293b" />
          <circle cx="21.5" cy="28.5" r="1.3" fill="#1e293b" />
        </svg>
      );

    case 'Building2':
    case 'Facility Management':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left Tower */}
          <rect
            x="4"
            y="9"
            width="11"
            height="19"
            rx="1.5"
            fill="#ede9fe"
            stroke="#4f46e5"
            strokeWidth="2"
          />
          {/* Left Windows */}
          <rect x="7" y="13" width="2" height="2" fill="#6366f1" />
          <rect x="11" y="13" width="2" height="2" fill="#6366f1" />
          <rect x="7" y="18" width="2" height="2" fill="#6366f1" />
          <rect x="11" y="18" width="2" height="2" fill="#6366f1" />
          {/* Right Higher Tower */}
          <rect
            x="15"
            y="4"
            width="13"
            height="24"
            rx="1.5"
            fill="#c7d2fe"
            fillOpacity="0.4"
            stroke="#4338ca"
            strokeWidth="2"
          />
          {/* Right Windows */}
          <rect x="18" y="8" width="2.5" height="2" fill="#4f46e5" />
          <rect x="23" y="8" width="2.5" height="2" fill="#4f46e5" />
          <rect x="18" y="13" width="2.5" height="2" fill="#4f46e5" />
          <rect x="23" y="13" width="2.5" height="2" fill="#4f46e5" />
          <rect x="18" y="18" width="2.5" height="2" fill="#4f46e5" />
          <rect x="23" y="18" width="2.5" height="2" fill="#4f46e5" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 4l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-7z"
            fill="#10b981"
            fillOpacity="0.3"
            stroke="#059669"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
