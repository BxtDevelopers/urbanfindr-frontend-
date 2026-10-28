'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Sofa,
  ShieldCheck,
  Check,
  Tag,
  Camera,
  UserCheck,
  FileText,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  PROPERTY_DATA_MODEL_FIELDS,
  SAMPLE_COMPLIANT_PROPERTY,
  validatePropertyModel,
  PROPERTY_PURPOSES,
  ALL_PROPERTY_TYPES,
  FURNISHING_OPTIONS,
  OWNERSHIP_ROLES,
  PUBLICATION_STATUSES
} from '@/lib/propertyModel';
import { money } from '@/lib/format';

export default function PropertyDataPreview() {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'schema' | 'json'
  const [propertyData, setPropertyData] = useState(SAMPLE_COMPLIANT_PROPERTY);
  const validation = validatePropertyModel(propertyData);

  const purposeMeta = PROPERTY_PURPOSES.find(p => p.value === propertyData.purpose) || PROPERTY_PURPOSES[0];
  const ownershipMeta = OWNERSHIP_ROLES.find(o => o.value === propertyData.ownership) || OWNERSHIP_ROLES[0];
  const statusMeta = PUBLICATION_STATUSES.find(s => s.value === propertyData.status) || PUBLICATION_STATUSES[0];

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-8 my-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Phase 4 • Step 1
            </span>
            <span className="text-xs text-stone-500 font-mono">Property Data Model Specification</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mt-2">
            Core Real Estate Property Schema
          </h2>
          <p className="text-stone-600 text-sm mt-1 max-w-2xl">
            This module standardizes all 16 required fields across the database schema, Express REST API, and Next.js UI components.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex bg-stone-200/80 p-1 rounded-xl text-sm font-medium text-stone-700">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'preview' ? 'bg-white text-stone-900 shadow-sm' : 'hover:text-stone-900'
            }`}
          >
            Live Preview
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'schema' ? 'bg-white text-stone-900 shadow-sm' : 'hover:text-stone-900'
            }`}
          >
            16 Fields Schema
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'json' ? 'bg-white text-stone-900 shadow-sm' : 'hover:text-stone-900'
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {/* Validation Status Strip */}
      <div className="mt-4 p-3.5 rounded-xl bg-white border border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {validation.valid ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
          )}
          <span className="text-sm font-semibold text-stone-800">
            {validation.valid
              ? 'Compliant with all 16 Real Estate Data Model fields'
              : `${validation.errors.length} validation issues detected`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Synced with Express REST Backend (`/api/properties/meta`)</span>
        </div>
      </div>

      {/* TAB CONTENT: Live Preview */}
      {activeTab === 'preview' && (
        <div className="mt-6 grid lg:grid-cols-12 gap-8 items-start">
          {/* Card Visualizer */}
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative aspect-[16/10] bg-stone-900">
              <img
                src={propertyData.images[0]}
                alt={propertyData.title}
                className="w-full h-full object-cover"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${purposeMeta.color}`}>
                  {purposeMeta.label}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-stone-900 shadow-sm border border-stone-200">
                  {propertyData.type}
                </span>
                {propertyData.verified && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs flex items-center gap-1.5 font-medium">
                <Camera size={14} />
                <span>{propertyData.images.length} Photos</span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {money(propertyData.price)}
                  {propertyData.purpose === 'rent' && <span className="text-sm font-normal text-stone-500"> / month</span>}
                </div>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${statusMeta.badge}`}>
                  {statusMeta.label}
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 mt-2 line-clamp-1">
                {propertyData.title}
              </h3>

              <div className="flex items-center gap-1.5 text-stone-500 text-sm mt-1">
                <MapPin size={15} className="shrink-0 text-stone-400" />
                <span>{propertyData.locality}, {propertyData.city}</span>
              </div>

              {/* Spec Strip */}
              <div className="grid grid-cols-4 gap-2 py-4 my-4 border-y border-stone-100 text-stone-700 text-xs sm:text-sm">
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-stone-50">
                  <span className="text-stone-400 text-xs">Bedrooms</span>
                  <div className="flex items-center gap-1 font-bold mt-0.5">
                    <Bed size={15} />
                    <span>{propertyData.bedrooms} BHK</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-stone-50">
                  <span className="text-stone-400 text-xs">Bathrooms</span>
                  <div className="flex items-center gap-1 font-bold mt-0.5">
                    <Bath size={15} />
                    <span>{propertyData.bathrooms} Baths</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-stone-50">
                  <span className="text-stone-400 text-xs">Area</span>
                  <div className="flex items-center gap-1 font-bold mt-0.5">
                    <Maximize2 size={15} />
                    <span>{propertyData.area} sqft</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-stone-50">
                  <span className="text-stone-400 text-xs">Furnishing</span>
                  <div className="flex items-center gap-1 font-bold mt-0.5">
                    <Sofa size={15} />
                    <span className="truncate">{propertyData.furnishing.split('-')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Amenities chips */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {propertyData.amenities.slice(0, 6).map((amenity, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-stone-100 text-stone-700 text-xs font-medium">
                      {amenity}
                    </span>
                  ))}
                  {propertyData.amenities.length > 6 && (
                    <span className="px-2 py-1 rounded bg-stone-100 text-stone-500 text-xs">
                      +{propertyData.amenities.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Owner / Broker Footer */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className="text-emerald-700" />
                  <span>Posted by <strong className="text-stone-900">{propertyData.owner.name}</strong></span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${ownershipMeta.badge}`}>
                    {ownershipMeta.label}
                  </span>
                </div>
                <span className="text-stone-400">Ready for Phase 4</span>
              </div>
            </div>
          </div>

          {/* Field mapping sidebar */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-base font-bold text-stone-900 flex items-center gap-2 mb-4">
              <Layers size={18} className="text-emerald-700" />
              16 Fields Coverage Checklist
            </h4>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 text-xs">
              {PROPERTY_DATA_MODEL_FIELDS.map((f, i) => (
                <div key={f.key} className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                      <span className="text-stone-400 font-mono text-[10px]">#{i + 1}</span>
                      <span>{f.label}</span>
                      <code className="text-[10px] text-stone-400 font-normal">({f.key})</code>
                    </div>
                    <p className="text-stone-500 text-[11px] mt-0.5">{f.desc}</p>
                  </div>
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Schema Inspector */}
      {activeTab === 'schema' && (
        <div className="mt-6 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-100 text-stone-600 font-bold border-b border-stone-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 pl-6">#</th>
                  <th className="p-3.5">Field Key</th>
                  <th className="p-3.5">Display Label</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Required</th>
                  <th className="p-3.5">Allowed Enums / Format</th>
                  <th className="p-3.5 pr-6">Database Schema</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {PROPERTY_DATA_MODEL_FIELDS.map((f, i) => (
                  <tr key={f.key} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3.5 pl-6 font-mono text-stone-400">{i + 1}</td>
                    <td className="p-3.5 font-bold font-mono text-emerald-800">{f.key}</td>
                    <td className="p-3.5 font-medium text-stone-900">{f.label}</td>
                    <td className="p-3.5 font-mono text-stone-600">{f.type}</td>
                    <td className="p-3.5">
                      {f.required ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">Required</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-600">Optional</span>
                      )}
                    </td>
                    <td className="p-3.5 text-stone-600 font-mono text-xs max-w-xs truncate">
                      {f.options ? f.options.join(', ') : f.desc}
                    </td>
                    <td className="p-3.5 pr-6 text-stone-500 font-mono text-[11px]">Property.{f.key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Raw JSON */}
      {activeTab === 'json' && (
        <div className="mt-6 bg-stone-950 text-emerald-400 p-6 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-stone-800">
          <pre>{JSON.stringify(propertyData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

