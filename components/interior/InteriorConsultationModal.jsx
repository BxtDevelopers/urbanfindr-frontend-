'use client';

import {  useState  } from 'react';
import {
  X,
  Calendar,
  Clock,
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  MapPin,
  Phone,
  User,
  Layers,
  Ruler,
  ShieldCheck,
  Video,
  Building,
  Home
} from 'lucide-react';
import { api, useApp } from '@/components/providers';

export default function InteriorConsultationModal({
  isOpen,
  onClose,
  preselectedPackage = null,
  preselectedDesigner = null,
  onSuccess
}) {
  const { user, toast } = useApp();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: 'Hyderabad',
    locality: '',
    address: '',
    bhkType: preselectedPackage?.bhk || '3 BHK',
    carpetAreaSqFt: '1450',
    possessionStatus: 'Ready to Move In',
    scopeOfWork: preselectedPackage?.scope || 'Full Home Turnkey',
    consultationType: 'Doorstep Site Measurement & Laser Survey',
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    preferredTimeSlot: '11:00 AM - 01:00 PM',
    designStyle: 'Modern Contemporary',
    packageTier: preselectedPackage?.tier || 'Premium',
    designerName: preselectedDesigner?.name || '',
    designerId: preselectedDesigner?.id || '',
    notes: '',
    floorPlanFile: null,
    floorPlanName: '',
    floorPlanPreview: null
  });

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith('image/');
      setFormData(prev => ({
        ...prev,
        floorPlanFile: file,
        floorPlanName: file.name,
        floorPlanPreview: isImg ? URL.createObjectURL(file) : '/photos/apartment-1.jpg'
      }));
      toast(`Floor plan "${file.name}" uploaded successfully.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      const payload = {
        category: 'Interior Designers',
        categorySlug: 'interior-designers',
        serviceType: formData.scopeOfWork || 'Full Home Interiors',
        workflowType: 'consultation',
        pricingType: 'quote',
        description: `Consultation Request: ${formData.bhkType} (${formData.carpetAreaSqFt} sq.ft) in ${formData.locality || formData.city}. Scope: ${formData.scopeOfWork}. Style: ${formData.designStyle}. Consultation: ${formData.consultationType}. Notes: ${formData.notes || 'None'}`,
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        locality: formData.locality,
        address: formData.address,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTimeSlot,
        preferredTimeSlot: formData.preferredTimeSlot,
        assignedSpecialist: formData.designerName || 'Deepika Rao (DesignHut Interiors)',
        categoryFields: {
          bhkType: formData.bhkType,
          carpetAreaSqFt: formData.carpetAreaSqFt,
          possessionStatus: formData.possessionStatus,
          consultationType: formData.consultationType,
          designStyle: formData.designStyle,
          packageTier: formData.packageTier
        }
      };

      const res = await api('service-requests', {
        method: 'POST',
        body: payload
      });

      setBookingSuccess(res);
      toast('Consultation request booked successfully! Our lead architect will contact you.');
      if (onSuccess) onSuccess(res);
    } catch (err) {
      toast(err.message || 'Failed to submit consultation request');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-6 flex flex-col items-center justify-start pt-6 sm:pt-10 pb-12"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh] relative shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header - Always Visible */}
        <div className="shrink-0 bg-gradient-to-r from-emerald-950 via-[#072418] to-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white m-0">
                Book Free Design Consultation
              </h2>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Includes 3D Walkthrough, Laser Floor Measurement &amp; Itemized Estimate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {bookingSuccess ? (
          /* SUCCESS STATE */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-stone-900">Consultation Scheduled!</h3>
              <p className="text-stone-600 max-w-md mx-auto text-xs sm:text-sm mt-2">
                Your consultation booking ID is{' '}
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {bookingSuccess.requestId || 'SR-2026-INT'}
                </span>
                . Our senior design specialist will connect with you shortly to confirm your slot.
              </p>
            </div>

            <div className="bg-stone-50 rounded-xl p-4 text-left border border-stone-200 space-y-2 text-xs text-stone-700 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="font-medium text-stone-500">Format:</span>
                <span className="font-semibold text-stone-900">{formData.consultationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-stone-500">Scheduled Slot:</span>
                <span className="font-semibold text-stone-900">{formData.preferredDate} ({formData.preferredTimeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-stone-500">Assigned Designer:</span>
                <span className="font-semibold text-stone-900">{formData.designerName || 'Lead Architect (DesignHut)'}</span>
              </div>
              {formData.floorPlanName && (
                <div className="flex justify-between">
                  <span className="font-medium text-stone-500">Uploaded Floor Plan:</span>
                  <span className="font-semibold text-emerald-700 truncate max-w-[200px]">{formData.floorPlanName}</span>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setBookingSuccess(null);
                  onClose();
                }}
                className="btn btn-primary text-xs px-6 py-2.5"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* MULTI-STEP CONSULTATION FORM */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            {/* Step Indicators Bar - Always Visible */}
            <div className="shrink-0 bg-stone-50/80 px-6 py-3 border-b border-stone-200 flex items-center justify-between text-xs">
              <div
                onClick={() => setStep(1)}
                className={`flex items-center gap-1.5 cursor-pointer font-bold transition-colors ${
                  step === 1 ? 'text-emerald-800 border-b-2 border-emerald-600 pb-0.5' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 1 ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-600'
                }`}>1</span>
                <span>Property &amp; Plan</span>
              </div>

              <div
                onClick={() => setStep(2)}
                className={`flex items-center gap-1.5 cursor-pointer font-bold transition-colors ${
                  step === 2 ? 'text-emerald-800 border-b-2 border-emerald-600 pb-0.5' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 2 ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-600'
                }`}>2</span>
                <span>Slot &amp; Format</span>
              </div>

              <div
                onClick={() => setStep(3)}
                className={`flex items-center gap-1.5 cursor-pointer font-bold transition-colors ${
                  step === 3 ? 'text-emerald-800 border-b-2 border-emerald-600 pb-0.5' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 3 ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-600'
                }`}>3</span>
                <span>Contact &amp; Confirm</span>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 overscroll-contain">
              {/* STEP 1: Property Details & Floor Plan Upload */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Home Configuration *
                      </label>
                      <select
                        value={formData.bhkType}
                        onChange={e => setFormData({ ...formData, bhkType: e.target.value })}
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="1 BHK">1 BHK (450 - 650 sq.ft)</option>
                        <option value="2 BHK">2 BHK (900 - 1,250 sq.ft)</option>
                        <option value="3 BHK">3 BHK (1,350 - 1,900 sq.ft)</option>
                        <option value="4 BHK / Luxury Villa">4 BHK / Luxury Villa (2,200+ sq.ft)</option>
                        <option value="Modular Kitchen Only">Modular Kitchen Only</option>
                        <option value="Living & Dining Only">Living &amp; Dining Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Approx Carpet Area (sq.ft)
                      </label>
                      <input
                        type="number"
                        value={formData.carpetAreaSqFt}
                        onChange={e => setFormData({ ...formData, carpetAreaSqFt: e.target.value })}
                        placeholder="e.g. 1450"
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Possession Status *
                      </label>
                      <select
                        value={formData.possessionStatus}
                        onChange={e => setFormData({ ...formData, possessionStatus: e.target.value })}
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2 bg-white"
                      >
                        <option value="Ready to Move In">Ready to Move In (Keys in hand)</option>
                        <option value="Possession within 30-60 Days">Possession within 30-60 Days</option>
                        <option value="Under Construction (3-6 Months)">Under Construction (3-6 Months)</option>
                        <option value="Renovation of Existing Flat">Renovation of Existing Flat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Aesthetic Style Preference
                      </label>
                      <select
                        value={formData.designStyle}
                        onChange={e => setFormData({ ...formData, designStyle: e.target.value })}
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2 bg-white"
                      >
                        <option value="Modern Contemporary">Modern Contemporary</option>
                        <option value="Minimalist Scandinavian">Minimalist Scandinavian</option>
                        <option value="Quiet Luxury & Warm Wood">Quiet Luxury &amp; Warm Wood</option>
                        <option value="Warm Bohemian">Warm Bohemian</option>
                        <option value="Classic Elegance">Classic Elegance</option>
                      </select>
                    </div>
                  </div>

                  {/* FEATURE 6: Floor-plan uploads */}
                  <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 bg-stone-50/70 hover:bg-stone-50 transition-colors">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                        <UploadCloud size={20} />
                      </div>
                      <p className="text-xs font-bold text-stone-800">
                        Upload 2D / 3D Floor Plan (Optional)
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        PNG, JPG, PDF, or CAD blueprint up to 25MB
                      </p>
                      <label className="mt-2.5 cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:border-emerald-500 rounded-lg text-xs font-semibold text-stone-700 shadow-xs transition-all">
                        <span>Browse Floor Plan</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {formData.floorPlanName && (
                      <div className="mt-3 flex items-center justify-between bg-white border border-emerald-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-stone-800 truncate">
                              {formData.floorPlanName}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-medium">Ready for architect evaluation</p>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 size={14} /> Attached
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Consultation Format & Site-Visit Request */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Select Consultation Format *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        {
                          id: 'Doorstep Site Measurement & Laser Survey',
                          label: 'Doorstep Site Visit',
                          desc: 'Laser measurement at your flat',
                          icon: Home
                        },
                        {
                          id: 'Virtual 3D Video Call (Free)',
                          label: 'Virtual 3D Call',
                          desc: 'Online screen share with architect',
                          icon: Video
                        },
                        {
                          id: 'Experience Center Meeting',
                          label: 'Experience Center',
                          desc: 'Touch material swatches in person',
                          icon: Building
                        }
                      ].map(item => {
                        const Icon = item.icon;
                        const active = formData.consultationType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, consultationType: item.id })}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              active
                                ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600 shadow-xs'
                                : 'border-stone-200 bg-white hover:border-stone-300'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
                              active ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'
                            }`}>
                              <Icon size={14} />
                            </div>
                            <p className="text-xs font-bold text-stone-900 leading-tight">{item.label}</p>
                            <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">{item.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <Calendar size={13} className="text-emerald-600" />
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <Clock size={13} className="text-emerald-600" />
                        Preferred Time Slot *
                      </label>
                      <select
                        value={formData.preferredTimeSlot}
                        onChange={e => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2 bg-white"
                      >
                        <option value="10:00 AM - 12:00 PM">Morning (10:00 AM - 12:00 PM)</option>
                        <option value="12:00 PM - 02:00 PM">Noon (12:00 PM - 02:00 PM)</option>
                        <option value="02:00 PM - 04:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                        <option value="04:00 PM - 06:00 PM">Evening (04:00 PM - 06:00 PM)</option>
                        <option value="06:00 PM - 08:00 PM">Late Evening (06:00 PM - 08:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  {formData.designerName && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between text-xs">
                      <span className="text-stone-600">Selected Interior Specialist:</span>
                      <span className="font-semibold text-emerald-800">{formData.designerName}</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Contact Details & Confirmation */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Aditya Sharma"
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        10-Digit Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98490 00000"
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="aditya@example.com"
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Locality / Apartment Name *
                      </label>
                      <input
                        type="text"
                        value={formData.locality}
                        onChange={e => setFormData({ ...formData, locality: e.target.value })}
                        placeholder="e.g. My Home Bhooja, Gachibowli"
                        className="w-full text-xs sm:text-sm rounded-lg border border-stone-300 px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Special Requirements / Questions for Designer
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g. Need pooja unit, acrylic modular kitchen with quartz counter, and ceiling track lights."
                      className="w-full text-xs rounded-lg border border-stone-300 p-2.5"
                    />
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-[11px] text-stone-600 space-y-1">
                    <p className="flex items-center gap-1.5 text-stone-800 font-bold">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      UrbanFindr Guarantee:
                    </p>
                    <p>• 100% Free Initial 3D Concept Design Consultation &amp; Laser Site Survey</p>
                    <p>• Zero obligation, transparent bill of quantities &amp; factory-finish pricing</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer Bar with Always-Visible Action Buttons */}
            <div className="shrink-0 bg-stone-50 border-t border-stone-200 px-6 py-3.5 flex justify-between items-center">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn btn-outline text-xs px-4 py-2 cursor-pointer"
                >
                  ← Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="btn btn-primary text-xs px-5 py-2 cursor-pointer"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-primary text-xs px-6 py-2.5 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {busy ? 'Booking Consultation...' : 'Confirm Consultation Booking ✓'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
