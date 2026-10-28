'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  ArrowLeft,
  CheckCircle2,
  House,
  KeyRound,
  BedDouble,
  BriefcaseBusiness,
  MapPin,
  Sparkles,
  ShieldCheck,
  Building2,
  Coins,
  Check,
  Plus,
  Compass,
  FileText,
  Camera,
  Handshake,
} from 'lucide-react';
import { api, useApp, useData } from './providers';
import { Field, Image, State, Submit } from './ui';
import CaptchaModal from './CaptchaModal';
import PropertyLocationPicker from './PropertyLocationPicker';
import { cities, amenities as defaultAmenities } from '@/lib/format';
import { categoryFor, categories, cityGuides } from '@/lib/catalog';
import { propertyGallery, propertyImages } from '@/lib/media';

export default function PropertyEditor({
  id,
  initialPurpose,
  initialCity,
  initialLocality,
  initialOwnership,
  onBack,
}) {
  const { data, error, loading } = useData(id ? `properties/${id}` : null);

  if (id && (loading || !data)) {
    return (
      <div className="wrap section">
        <State loading={loading} error={error} />
      </div>
    );
  }

  return (
    <Editor
      key={id || `${initialPurpose}-${initialCity}-${initialLocality}` || 'new'}
      item={data}
      initialPurpose={initialPurpose}
      initialCity={initialCity}
      initialLocality={initialLocality}
      initialOwnership={initialOwnership}
      onBack={onBack}
    />
  );
}

function Editor({
  item,
  initialPurpose,
  initialCity,
  initialLocality,
  initialOwnership,
  onBack,
}) {
  const router = useRouter();
  const { user, setUser, refresh, toast } = useApp();

  // Primary Classification
  const [purpose, setPurpose] = useState(item?.purpose || initialPurpose || 'rent');
  const [type, setType] = useState(
    item?.type || categoryFor(initialPurpose || 'rent')?.types?.[0] || 'Apartment'
  );

  // Ownership role (adapted dynamically per category: owner, broker, channel_partner, builder)
  const [ownership, setOwnership] = useState(item?.ownership || initialOwnership || 'owner');
  const [company, setCompany] = useState(user?.company || '');
  const [reraId, setReraId] = useState(user?.reraId || '');

  // Location fields
  const [city, setCity] = useState(item?.city || initialCity || 'Bengaluru');
  const [locality, setLocality] = useState(item?.locality || initialLocality || '');
  const [address, setAddress] = useState(item?.address || '');
  const [coordinates, setCoordinates] = useState(
    item?.coordinates?.lat && item?.coordinates?.lng
      ? { lat: Number(item.coordinates.lat), lng: Number(item.coordinates.lng) }
      : null
  );
  const [locationPrecision, setLocationPrecision] = useState(
    item?.locationPrecision || 'exact'
  );
  const [radiusMeters, setRadiusMeters] = useState(
    Number(item?.radiusMeters) || 500
  );
  const [hideExactAddress, setHideExactAddress] = useState(
    Boolean(item?.hideExactAddress)
  );

  // Content
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');

  // Financials
  const [price, setPrice] = useState(item?.price ?? '');
  const [deposit, setDeposit] = useState(item?.deposit ?? '');
  const [maintenance, setMaintenance] = useState(item?.maintenance ?? '');

  // Dimensions & Specs
  const [area, setArea] = useState(item?.area ?? '');
  const [bedrooms, setBedrooms] = useState(
    item?.bedrooms ?? (initialPurpose === 'buy' || initialPurpose === 'rent' ? 2 : 0)
  );
  const [bathrooms, setBathrooms] = useState(
    item?.bathrooms ?? (initialPurpose === 'buy' || initialPurpose === 'rent' ? 2 : 1)
  );
  const [furnishing, setFurnishing] = useState(
    item?.furnishing || (initialPurpose === 'pg' ? 'Fully furnished' : 'Semi-furnished')
  );
  const [propertyAge, setPropertyAge] = useState(item?.propertyAge || 'Newly built');
  const [availableFrom, setAvailableFrom] = useState(
    item?.availableFrom?.slice(0, 10) || new Date().toISOString().slice(0, 10)
  );
  const [preferredTenant, setPreferredTenant] = useState(item?.preferredTenant || 'Anyone');
  const [parking, setParking] = useState(item?.parking ?? true);

  // Category-specific details
  const [transaction, setTransaction] = useState(
    item?.transaction || (initialPurpose === 'buy' ? 'sale' : 'lease')
  );
  const [sharing, setSharing] = useState(item?.sharing || 'Private room');
  const [availableBeds, setAvailableBeds] = useState(item?.availableBeds ?? 1);
  const [mealsIncluded, setMealsIncluded] = useState(Boolean(item?.mealsIncluded));

  // Amenities & Media
  const [amenities, setAmenities] = useState(
    item?.amenities || [
      'Power Backup',
      '24/7 Security',
      'Lift',
      'Water Supply',
      'Parking',
      'CCTV',
    ]
  );
  const [images, setImages] = useState(item ? propertyImages(item) : []);
  const [photoLink, setPhotoLink] = useState('');

  // Processing state
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);

  // Quick localities suggestion for current city
  const suggestedLocalities = useMemo(() => {
    return (
      cityGuides.find((c) => c.name.toLowerCase() === city.toLowerCase())?.localities || []
    );
  }, [city]);

  // Purpose tab switch handler
  function handlePurposeChange(newPurpose) {
    setPurpose(newPurpose);
    const validTypes = categoryFor(newPurpose)?.types || ['Apartment'];
    setType(validTypes[0]);

    // Re-adjust ownership if needed
    if (newPurpose === 'rent' && ownership === 'builder') {
      setOwnership('owner');
    } else if (newPurpose === 'pg' && (ownership === 'builder' || ownership === 'channel_partner')) {
      setOwnership('owner');
    } else if (newPurpose === 'commercial' && ownership === 'builder') {
      setOwnership('owner');
    }

    // Adapt category defaults
    if (newPurpose === 'buy') {
      setTransaction('sale');
      if (bedrooms === 0) setBedrooms(2);
      if (bathrooms === 0) setBathrooms(2);
    } else if (newPurpose === 'rent') {
      setTransaction('lease');
      if (bedrooms === 0) setBedrooms(2);
      if (bathrooms === 0) setBathrooms(2);
    } else if (newPurpose === 'pg') {
      setFurnishing('Fully furnished');
      setBedrooms(0);
      setBathrooms(1);
    } else if (newPurpose === 'commercial') {
      setTransaction('lease');
      setBedrooms(0);
    }
  }

  // Quick Description Generator
  function generateDescription() {
    const locText = locality ? `${locality}, ${city}` : city;
    let draft = '';

    if (purpose === 'rent') {
      draft = `Spacious and well-maintained ${bedrooms} BHK ${type.toLowerCase()} available for rent in prime ${locText}. The property is ${furnishing.toLowerCase()} with a built-up area of ${
        area || 'well-proportioned'
      } sq ft. Ideal for ${preferredTenant.toLowerCase()}. Features include ${
        parking ? 'dedicated parking, ' : ''
      }24/7 continuous water supply, power backup, and round-the-clock security. Conveniently located near leading schools, hospitals, transit hubs, and markets. Available for immediate occupancy from ${availableFrom}.`;
    } else if (purpose === 'buy') {
      if (type === 'Plot') {
        draft = `Prime residential plot measuring ${
          area || 'generous'
        } sq ft for sale in the high-growth corridor of ${locText}. Excellent investment opportunity with 100% clear legal titles, ${propertyAge.toLowerCase()} status, and immediate registration. Wide road access with ready connections for electricity and water. Close to major highways and upcoming metro connectivity. Possession ready from ${availableFrom}.`;
      } else {
        draft = `Elegant and sunlit ${bedrooms} BHK ${type.toLowerCase()} for sale in the coveted neighborhood of ${locText}. Offering ${
          area || 'ample'
        } sq ft of thoughtfully designed living space, this ${propertyAge.toLowerCase()} property is ${furnishing.toLowerCase()}. Includes ${
          parking ? 'reserved covered parking, ' : ''
        }modern fittings, high-speed lift, clubhouse access, and 24/7 security. Prime location with effortless connectivity.`;
      }
    } else if (purpose === 'pg') {
      draft = `Premium and fully-managed PG / Co-living accommodation located in ${locText}. Offering comfortable ${sharing.toLowerCase()} with ${furnishing.toLowerCase()} setup and ${availableBeds} beds currently available. ${
        mealsIncluded
          ? 'Nutritious and hygienic home-style meals included in monthly rent. '
          : ''
      }Equipped with high-speed WiFi, daily housekeeping, RO drinking water, and round-the-clock CCTV security. Ideal for ${preferredTenant.toLowerCase()}. Move-in ready from ${availableFrom}.`;
    } else if (purpose === 'commercial') {
      draft = `Grade-A commercial ${type.toLowerCase()} available for ${
        transaction === 'sale' ? 'outright sale' : 'lease'
      } in the bustling commercial hub of ${locText}. Spanning ${
        area || 'expansive'
      } sq ft super built-up area with ${furnishing.toLowerCase()} layout and ${bathrooms} washrooms. Suitable for corporate headquarters, IT/ITES firms, retail outlets, or logistics hubs. Features ${
        parking ? 'ample reserved parking, ' : ''
      }fire safety compliance, high-speed lifts, and uninterrupted power backup.`;
    }

    setDescription(draft);

    if (!title.trim()) {
      if (purpose === 'pg') {
        setTitle(`Comfortable ${sharing} PG / Co-living in ${locality || city}`);
      } else if (purpose === 'buy' && type === 'Plot') {
        setTitle(`Prime ${area ? `${area} Sq Ft ` : ''}Plot for Sale in ${locality || city}`);
      } else if (purpose === 'commercial') {
        setTitle(`${area ? `${area} Sq Ft ` : ''}Commercial ${type} for ${transaction === 'sale' ? 'Sale' : 'Lease'} in ${locality || city}`);
      } else {
        setTitle(`Light-filled ${bedrooms} BHK ${type} in ${locality || city}`);
      }
    }
  }

  // Toggle amenities
  function toggleAmenity(name) {
    setAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  }

  // Multi-file image upload handler
  async function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    const remainingSlots = 12 - images.length;
    if (remainingSlots <= 0) {
      toast('Maximum 12 photos reached. Remove some photos to add more.');
      return;
    }

    const files = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(f.name))
      .slice(0, remainingSlots);

    if (files.length === 0) {
      toast('Please choose valid images (JPEG, PNG, or WebP up to 5 MB).');
      return;
    }

    setUploading(true);
    setUploadProgress(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}…`);

    try {
      // 1. Try batch multi-file upload
      const data = new FormData();
      for (const file of files) {
        data.append('files', file);
      }
      try {
        const result = await api('uploads', { method: 'POST', body: data });
        const uploadedUrls = result.urls || (result.url ? [result.url] : []);
        if (uploadedUrls.length > 0) {
          setImages((v) => [...v, ...uploadedUrls].slice(0, 12));
          toast(`Added ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''}!`);
          return;
        }
      } catch (batchErr) {
        console.warn('Batch upload failed, falling back to parallel individual upload...', batchErr);
      }

      // 2. Individual parallel upload fallback
      const uploadPromises = files.map(async (file) => {
        try {
          const singleData = new FormData();
          singleData.append('file', file);
          const singleRes = await api('uploads', { method: 'POST', body: singleData });
          return singleRes.url;
        } catch {
          // 3. Client FileReader preview fallback if server offline or rejected
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          });
        }
      });

      const results = await Promise.all(uploadPromises);
      const valid = results.filter(Boolean);
      if (valid.length > 0) {
        setImages((v) => [...v, ...valid].slice(0, 12));
        toast(`Added ${valid.length} photo${valid.length > 1 ? 's' : ''}!`);
      }
    } catch (err) {
      toast(err.message || 'Failed to upload photos.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  }

  // Pre-submission validation: validates form fields then prompts Captcha
  function handlePreSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      if (!title.trim() || title.trim().length < 8) {
        throw new Error('Please enter a descriptive listing title (min 8 characters).');
      }
      if (!locality.trim()) {
        throw new Error('Please specify the property locality or neighborhood.');
      }
      if (!address.trim() || address.trim().length < 5) {
        throw new Error('Please enter the full address (min 5 characters).');
      }
      if (!price || Number(price) <= 0) {
        throw new Error('Please enter a valid price / rent amount.');
      }
      if (!area || Number(area) <= 0) {
        throw new Error('Please enter a valid built-up or plot area.');
      }
      if (!description.trim() || description.trim().length < 30) {
        throw new Error('Please write a property description of at least 30 characters.');
      }
      if (images.length === 0) {
        throw new Error('Please add at least 1 photo for your listing.');
      }

      // Channel Partner validation: Firm name and RERA ID are strictly REQUIRED
      if (ownership === 'channel_partner') {
        if (!company || !company.trim()) {
          throw new Error('Channel Partner Agency / Firm Name is required.');
        }
        if (!reraId || !reraId.trim()) {
          throw new Error('Channel Partner RERA Registration ID is required.');
        }
      }

      // All validation passed -> Trigger Security Captcha verification
      setShowCaptcha(true);
    } catch (err) {
      setError(err.message);
      toast(err.message);
    }
  }

  const submit = handlePreSubmit;

  // Final submission after Captcha verification
  async function doFinalSubmit() {
    setError('');
    setBusy(true);

    try {
      const isPlot = purpose === 'buy' && type === 'Plot';
      const isPG = purpose === 'pg';
      const isCommercial = purpose === 'commercial';

      const payload = {
        title: title.trim(),
        description: description.trim(),
        purpose,
        type,
        city: city.trim(),
        locality: locality.trim(),
        address: address.trim(),
        price: Number(price),
        deposit: isPlot || (isCommercial && transaction === 'sale') || purpose === 'buy'
          ? 0
          : Number(deposit) || 0,
        maintenance: Number(maintenance) || 0,
        bedrooms: isPlot || isPG || isCommercial ? 0 : Number(bedrooms) || 0,
        bathrooms: isPlot ? 0 : isCommercial ? Number(bathrooms) || 0 : isPG ? 1 : Number(bathrooms) || 0,
        area: Number(area),
        furnishing: isPlot ? 'Unfurnished' : furnishing,
        availableFrom,
        preferredTenant: purpose === 'rent' || isPG ? preferredTenant : 'Anyone',
        parking: isPlot ? false : parking,
        amenities,
        images,
        ownership,
        propertyAge,
        transaction: isCommercial ? transaction : purpose === 'buy' ? 'sale' : 'lease',
        sharing: isPG ? sharing : 'Private room',
        mealsIncluded: isPG ? mealsIncluded : false,
        availableBeds: isPG ? Number(availableBeds) || 1 : 1,
      };

      const res = await api(item ? `properties/${item._id}` : 'properties', {
        method: item ? 'PATCH' : 'POST',
        body: payload,
      });

      // If channel partner provided firm/RERA info, sync profile
      if (ownership === 'channel_partner' && (company || reraId)) {
        try {
          await api('auth/profile', {
            method: 'PATCH',
            body: { company: company.trim(), reraId: reraId.trim() },
          });
        } catch (_) {}
      }

      // If user was a standard user, upgrade local session role immediately
      if (user && user.role === 'user') {
        const newRole =
          ownership === 'broker'
            ? 'broker'
            : ownership === 'channel_partner'
            ? 'channel_partner'
            : ownership === 'builder'
            ? 'builder'
            : 'owner';
        setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
      }
      await refresh();

      setShowCaptcha(false);
      toast(
        item
          ? 'Listing updated successfully!'
          : 'Your listing has been submitted and is pending administrator review!'
      );
      router.push('/dashboard/properties');
    } catch (err) {
      setError(err.message);
      toast(err.message);
      setShowCaptcha(false);
    } finally {
      setBusy(false);
    }
  }

  // Tab icon map
  const tabIcons = {
    buy: House,
    rent: KeyRound,
    pg: BedDouble,
    commercial: BriefcaseBusiness,
  };

  return (
    <div className="wrap pb-20 max-w-4xl">
      {onBack && (
        <div className="pt-6">
          <button
            type="button"
            onClick={onBack}
            className="btn-outline !min-h-0 !py-2 !px-3.5 !text-sm inline-flex items-center gap-2 hover:bg-forest hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to Sign-in
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-heading !pt-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest mb-1">
          <Sparkles size={15} />
          {item ? 'EDIT PROPERTY LISTING' : 'FREE PROPERTY SUBMISSION'}
        </div>
        <h1>{item ? 'Fine-tune your property listing.' : 'List your property in under 3 minutes.'}</h1>
        <p className="muted mt-2">
          Reach thousands of genuine seekers with zero brokerage and direct verified inquiries.
        </p>
      </div>

      <form onSubmit={handlePreSubmit} className="space-y-6">
        {error && (
          <div className="error whitespace-pre-line" role="alert">
            {error}
          </div>
        )}

        {/* ── SECTION 1: PURPOSE SELECTION TABS ── */}
        <div className="nb-card !mb-0 overflow-hidden">
          <div className="nb-tabs">
            {categories.map((cat) => {
              const Icon = tabIcons[cat.purpose] || House;
              const isActive = purpose === cat.purpose;
              return (
                <button
                  key={cat.purpose}
                  type="button"
                  className={`nb-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handlePurposeChange(cat.purpose)}
                >
                  <Icon size={18} />
                  <span>
                    {cat.purpose === 'buy'
                      ? 'Buy / Resale'
                      : cat.purpose === 'rent'
                      ? 'Rent'
                      : cat.purpose === 'pg'
                      ? 'PG / Co-living'
                      : 'Commercial'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-5 bg-white border-t border-stone-100 flex items-center justify-between flex-wrap gap-3 text-sm">
            <span className="text-stone-600">
              Listing category:{' '}
              <strong className="text-forest capitalize">
                {purpose === 'buy'
                  ? 'Property for Sale / Resale'
                  : purpose === 'rent'
                  ? 'Residential Rental'
                  : purpose === 'pg'
                  ? 'PG / Hostel / Co-living'
                  : 'Commercial Property'}
              </strong>
            </span>
            <span className="text-xs bg-[#edf3e2] text-forest font-semibold px-2.5 py-1 rounded-full">
              ✓ Direct Inquiry Network
            </span>
          </div>
        </div>

        {/* ── SECTION 2: LISTING ROLE & OWNERSHIP (OWNER, BROKER, CHANNEL PARTNER, BUILDER) ── */}
        <div className="panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="!text-lg font-semibold text-stone-900">
                You Are Listing As <span className="text-red-500 font-bold">*</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Select your role: Owner, Real Estate Broker, Channel Partner, or Builder
              </p>
            </div>
            <ShieldCheck size={20} className="text-forest" />
          </div>

          <div className={`grid gap-3 ${purpose === 'buy' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
            {/* Direct Owner Option */}
            <button
              type="button"
              onClick={() => setOwnership('owner')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                ownership === 'owner'
                  ? 'border-forest bg-[#edf3e2] text-stone-900 font-semibold shadow-sm'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <House size={17} className={ownership === 'owner' ? 'text-forest' : 'text-stone-400'} />
                <span className="text-sm">
                  {purpose === 'pg'
                    ? 'PG Owner / Host'
                    : purpose === 'commercial'
                    ? 'Commercial Owner'
                    : 'Direct Property Owner'}
                </span>
              </div>
              <p className="text-[11px] font-normal text-stone-500">
                Zero brokerage, direct calls from seekers
              </p>
            </button>

            {/* Real Estate Broker Option */}
            <button
              type="button"
              onClick={() => setOwnership('broker')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                ownership === 'broker'
                  ? 'border-forest bg-[#edf3e2] text-stone-900 font-semibold shadow-sm'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <BriefcaseBusiness
                  size={17}
                  className={ownership === 'broker' ? 'text-forest' : 'text-stone-400'}
                />
                <span className="text-sm">
                  {purpose === 'commercial'
                    ? 'Commercial Broker'
                    : purpose === 'pg'
                    ? 'Property Manager / Agent'
                    : 'Real Estate Broker'}
                </span>
              </div>
              <p className="text-[11px] font-normal text-stone-500">
                Certified agent representing the property
              </p>
            </button>

            {/* Channel Partner (CP) Option */}
            {purpose !== 'pg' && (
              <button
                type="button"
                onClick={() => setOwnership('channel_partner')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  ownership === 'channel_partner'
                    ? 'border-forest bg-[#edf3e2] text-stone-900 font-semibold shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Handshake
                    size={17}
                    className={
                      ownership === 'channel_partner' ? 'text-forest' : 'text-stone-400'
                    }
                  />
                  <span className="text-sm">Channel Partner (CP)</span>
                </div>
                <p className="text-[11px] font-normal text-stone-500">
                  Authorized developer sales partner / mandate
                </p>
              </button>
            )}

            {/* Builder / Developer Option (Only for Buy / Sale) */}
            {purpose === 'buy' && (
              <button
                type="button"
                onClick={() => setOwnership('builder')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  ownership === 'builder'
                    ? 'border-forest bg-[#edf3e2] text-stone-900 font-semibold shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building2
                    size={17}
                    className={ownership === 'builder' ? 'text-forest' : 'text-stone-400'}
                  />
                  <span className="text-sm">Builder / Developer</span>
                </div>
                <p className="text-[11px] font-normal text-stone-500">
                  New project or residential layout launch
                </p>
              </button>
            )}
          </div>

          {/* Channel Partner Agency Details (REQUIRED when CP is selected) */}
          {ownership === 'channel_partner' && (
            <div className="mt-4 p-3.5 bg-[#f4f7ee] rounded-xl border border-[#d2dfc4] grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-forest uppercase tracking-wider mb-1">
                  Channel Partner Agency / Firm Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Realty Partners"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="input !text-xs !py-1.5"
                />
              </div>
              <div>
                <label className="block font-bold text-forest uppercase tracking-wider mb-1">
                  CP RERA Registration ID <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRM/KA/RERA/1251/..."
                  value={reraId}
                  onChange={(e) => setReraId(e.target.value)}
                  className="input !text-xs !py-1.5"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 3: LOCATION & ADDRESS ── */}
        <div className="panel">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-forest" />
            <div>
              <h3 className="!text-lg font-semibold text-stone-900">Property Location</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Accurate location ensures high-intent local inquiries
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* City Selector */}
            <Field label="City" required>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="input font-medium"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            {/* Locality */}
            <Field label="Locality / Neighborhood" required>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Indiranagar, Whitefield, Koramangala"
                required
                minLength={2}
                maxLength={120}
                className="input"
              />
            </Field>
          </div>

          {/* Quick Locality Chips */}
          {suggestedLocalities.length > 0 && (
            <div className="mt-3 flex items-center flex-wrap gap-1.5">
              <span className="text-xs text-stone-500 mr-1">Popular in {city}:</span>
              {suggestedLocalities.slice(0, 7).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocality(loc)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    locality.toLowerCase() === loc.toLowerCase()
                      ? 'bg-forest text-white border-forest font-medium'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-forest/50'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}

          {/* Interactive Map & Geolocation Picker */}
          <div className="mt-5 pt-4 border-t border-stone-200">
            <PropertyLocationPicker
              city={city}
              locality={locality}
              address={address}
              coordinates={coordinates}
              locationPrecision={locationPrecision}
              radiusMeters={radiusMeters}
              hideExactAddress={hideExactAddress}
              onCityChange={setCity}
              onLocalityChange={setLocality}
              onAddressChange={setAddress}
              onCoordinatesChange={setCoordinates}
              onPrecisionChange={setLocationPrecision}
              onRadiusChange={setRadiusMeters}
              onHideExactAddressChange={setHideExactAddress}
            />
          </div>

          {/* Street Address */}
          <div className="mt-4">
            <Field label="Complete Address / Street" required>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat No., Building / Society Name, Street, Landmark"
                required
                minLength={5}
                maxLength={300}
                className="input"
              />
            </Field>
          </div>
        </div>

        {/* ── SECTION 4: PROPERTY SPECIFICATIONS ── */}
        <div className="panel">
          <div className="flex items-center gap-2 mb-4">
            <Compass size={20} className="text-forest" />
            <div>
              <h3 className="!text-lg font-semibold text-stone-900">
                {purpose === 'commercial'
                  ? 'Commercial Space Specifications'
                  : purpose === 'pg'
                  ? 'PG & Room Specifications'
                  : purpose === 'buy' && type === 'Plot'
                  ? 'Plot & Land Specifications'
                  : 'Property Specifications'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Detailed specs help seekers match their requirements accurately
              </p>
            </div>
          </div>

          {/* Commercial Transaction Selector */}
          {purpose === 'commercial' && (
            <div className="mb-5 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
                Commercial Transaction Type <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setTransaction('lease')}
                  className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${
                    transaction === 'lease'
                      ? 'bg-forest text-white border-forest'
                      : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  Lease / Monthly Rent
                </button>
                <button
                  type="button"
                  onClick={() => setTransaction('sale')}
                  className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${
                    transaction === 'sale'
                      ? 'bg-forest text-white border-forest'
                      : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  Outright Sale
                </button>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-5">
            {/* Property Type */}
            <Field label="Property Type" required>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input font-medium"
              >
                {(categoryFor(purpose)?.types || ['Apartment']).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            {/* If Plot (Buy) */}
            {purpose === 'buy' && type === 'Plot' ? (
              <>
                <Field label="Plot Area (sq ft)" required>
                  <input
                    type="number"
                    min="1"
                    max="10000000"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 1500"
                    className="input"
                  />
                </Field>

                <Field label="Property Title / Age" required>
                  <select
                    value={propertyAge}
                    onChange={(e) => setPropertyAge(e.target.value)}
                    className="input"
                  >
                    <option value="Newly built">Newly approved layout (Ready to register)</option>
                    <option value="Resale">Resale plot (Private ownership)</option>
                    <option value="Older property">Ancestral / Established plot</option>
                  </select>
                </Field>
              </>
            ) : purpose === 'pg' ? (
              <>
                {/* PG Room Sharing */}
                <Field label="Room Sharing" required>
                  <select
                    value={sharing}
                    onChange={(e) => setSharing(e.target.value)}
                    className="input"
                  >
                    <option value="Private room">Private room (Single occupancy)</option>
                    <option value="2 sharing">2 Sharing</option>
                    <option value="3 sharing">3 Sharing</option>
                    <option value="4+ sharing">4+ Sharing</option>
                  </select>
                </Field>

                {/* Available Beds */}
                <Field label="Available Beds" required>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={availableBeds}
                    onChange={(e) => setAvailableBeds(e.target.value)}
                    className="input"
                  />
                </Field>

                {/* PG Area */}
                <Field label="Room / Carpet Area (sq ft)" required>
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 250"
                    className="input"
                  />
                </Field>
              </>
            ) : purpose === 'commercial' ? (
              <>
                {/* Super Built-up Area */}
                <Field label="Super Built-up Area (sq ft)" required>
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 2400"
                    className="input"
                  />
                </Field>

                {/* Washrooms */}
                <Field label="Washrooms / Restrooms" required>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="input"
                  />
                </Field>
              </>
            ) : (
              <>
                {/* Residential BHK */}
                <Field label="Bedrooms / BHK" required>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="input"
                  >
                    {[1, 2, 3, 4, 5, 6].map((b) => (
                      <option key={b} value={b}>
                        {b} BHK
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Bathrooms */}
                <Field label="Bathrooms" required>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="input"
                  >
                    {[1, 2, 3, 4, 5].map((b) => (
                      <option key={b} value={b}>
                        {b} Bathrooms
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Built-up Area */}
                <Field label="Super Built-up Area (sq ft)" required>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 1250"
                    className="input"
                  />
                </Field>
              </>
            )}

            {/* Furnishing (Non-plot) */}
            {!(purpose === 'buy' && type === 'Plot') && (
              <Field
                label={purpose === 'commercial' ? 'Fit-out / Furnishing' : 'Furnishing'}
                required
              >
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="input"
                >
                  <option value="Fully furnished">
                    {purpose === 'commercial' ? 'Fully Furnished (Fit-out ready)' : 'Fully furnished'}
                  </option>
                  <option value="Semi-furnished">
                    {purpose === 'commercial' ? 'Warm Shell (Semi-furnished)' : 'Semi-furnished'}
                  </option>
                  <option value="Unfurnished">
                    {purpose === 'commercial' ? 'Bare Shell (Unfurnished)' : 'Unfurnished'}
                  </option>
                </select>
              </Field>
            )}

            {/* Property Age (For Buy non-plot) */}
            {purpose === 'buy' && type !== 'Plot' && (
              <Field label="Property Age" required>
                <select
                  value={propertyAge}
                  onChange={(e) => setPropertyAge(e.target.value)}
                  className="input"
                >
                  <option value="Newly built">Newly built (Ready to move / &lt; 1 yr)</option>
                  <option value="Resale">Resale property (1 - 5 yrs)</option>
                  <option value="Older property">Older property (5+ yrs)</option>
                </select>
              </Field>
            )}

            {/* Available From / Possession */}
            <Field
              label={purpose === 'buy' ? 'Possession Date' : 'Available From'}
              required
            >
              <input
                type="date"
                required
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="input"
              />
            </Field>

            {/* Preferred Tenants (Rent & PG) */}
            {(purpose === 'rent' || purpose === 'pg') && (
              <Field label={purpose === 'pg' ? 'Preferred Guests' : 'Preferred Tenants'}>
                <select
                  value={preferredTenant}
                  onChange={(e) => setPreferredTenant(e.target.value)}
                  className="input"
                >
                  <option value="Anyone">Anyone (Family, Bachelors or Working)</option>
                  <option value="Family">Families Only</option>
                  <option value="Bachelors">Bachelors / Working Professionals</option>
                  <option value="Women">Women Only</option>
                  <option value="Men">Men Only</option>
                </select>
              </Field>
            )}
          </div>

          {/* Toggles (Parking / Meals) */}
          <div className="mt-5 flex items-center flex-wrap gap-6 pt-2 border-t border-stone-100">
            {!(purpose === 'buy' && type === 'Plot') && (
              <label className="check-label flex items-center gap-2 cursor-pointer font-medium text-sm">
                <input
                  type="checkbox"
                  checked={parking}
                  onChange={(e) => setParking(e.target.checked)}
                />
                <span>Dedicated Parking Available</span>
              </label>
            )}

            {purpose === 'pg' && (
              <label className="check-label flex items-center gap-2 cursor-pointer font-medium text-sm text-forest">
                <input
                  type="checkbox"
                  checked={mealsIncluded}
                  onChange={(e) => setMealsIncluded(e.target.checked)}
                />
                <span>Meals Included in Rent (Breakfast / Dinner)</span>
              </label>
            )}
          </div>
        </div>

        {/* ── SECTION 5: PRICING & FINANCIALS ── */}
        <div className="panel">
          <div className="flex items-center gap-2 mb-4">
            <Coins size={20} className="text-forest" />
            <div>
              <h3 className="!text-lg font-semibold text-stone-900">
                {purpose === 'buy'
                  ? 'Asking Price & Charges'
                  : purpose === 'commercial' && transaction === 'sale'
                  ? 'Commercial Sale Price'
                  : 'Rent & Deposit Details'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Transparent pricing drives 3x more genuine calls
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {/* Primary Price Field */}
            <Field
              label={
                purpose === 'buy'
                  ? 'Total Asking Price (₹)'
                  : purpose === 'commercial' && transaction === 'sale'
                  ? 'Total Outright Sale Price (₹)'
                  : purpose === 'pg'
                  ? 'Monthly Rent per Bed (₹)'
                  : 'Monthly Rent (₹)'
              }
              required
            >
              <input
                type="number"
                min="100"
                max="10000000000"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={purpose === 'buy' ? 'e.g. 8500000' : 'e.g. 28000'}
                className="input font-semibold text-stone-900"
              />
            </Field>

            {/* Security Deposit (Only for Rent, PG, Commercial Lease) */}
            {!(purpose === 'buy' || (purpose === 'commercial' && transaction === 'sale')) && (
              <Field label="Security Deposit (₹)">
                <input
                  type="number"
                  min="0"
                  max="100000000"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="e.g. 100000"
                  className="input"
                />
              </Field>
            )}

            {/* Maintenance */}
            <Field label="Monthly Maintenance (₹)">
              <input
                type="number"
                min="0"
                max="1000000"
                value={maintenance}
                onChange={(e) => setMaintenance(e.target.value)}
                placeholder="0 if included in rent"
                className="input"
              />
            </Field>
          </div>
        </div>

        {/* ── SECTION 6: TITLE & STORY ── */}
        <div className="panel">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-forest" />
              <div>
                <h3 className="!text-lg font-semibold text-stone-900">Property Description</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Highlight unique advantages, sunlight, ventilation, and nearby hubs
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={generateDescription}
              className="text-xs bg-[#edf3e2] text-forest hover:bg-forest hover:text-white px-3 py-1.5 rounded-lg border border-[#d2dfc4] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles size={14} />
              Auto-Draft Description
            </button>
          </div>

          <Field label="Listing Title" required>
            <input
              type="text"
              required
              minLength={8}
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunny 3 BHK with Balcony in Indiranagar near Metro"
              className="input font-medium"
            />
          </Field>

          <div className="mt-4">
            <Field label="Detailed Description (min 30 characters)" required>
              <textarea
                required
                minLength={30}
                maxLength={5000}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what makes this space great: layout, sunlight, proximity to tech parks/schools, society culture, etc."
                className="input leading-relaxed"
              />
            </Field>
            <div className="flex justify-between items-center text-xs text-stone-400 mt-1">
              <span>Min 30 chars • Max 5000 chars</span>
              <span>{description.length} / 5000</span>
            </div>
          </div>
        </div>

        {/* ── SECTION 7: AMENITIES ── */}
        <div className="panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="!text-lg font-semibold text-stone-900">Amenities &amp; Facilities</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Select all features available on the premises
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (amenities.length > 5) setAmenities([]);
                else setAmenities(defaultAmenities.slice(0, 10));
              }}
              className="text-xs text-forest underline font-semibold"
            >
              {amenities.length > 5 ? 'Clear Selection' : 'Select Common'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {defaultAmenities.map((amenity) => {
              const isSelected = amenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`p-2.5 rounded-lg border text-left text-xs font-medium flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-forest bg-[#edf3e2] text-forest font-semibold'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <span className="truncate mr-1">{amenity}</span>
                  {isSelected && <Check size={14} className="text-forest flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 8: HIGH RESOLUTION PHOTOS ── */}
        <div className="panel">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Camera size={20} className="text-forest" />
              <div>
                <h3 className="!text-lg font-semibold text-stone-900">
                  Property Photos <span className="text-red-500 font-bold">*</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  High quality photos get 5x more clicks. Add 1 to 12 images.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={images.length >= 12}
              onClick={() => {
                const samples = propertyGallery({ purpose, type }, images.length);
                setImages((v) => [...v, ...samples].slice(0, 12));
              }}
              className="text-xs bg-stone-100 text-stone-700 hover:bg-forest hover:text-white px-3 py-1.5 rounded-lg border border-stone-200 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles size={14} />
              Add Sample Photos
            </button>
          </div>

          {/* Multi-Photo Drag & Drop Dropzone */}
          <label
            htmlFor="property-multi-file-input"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
              if (e.dataTransfer?.files) {
                handleFiles(e.dataTransfer.files);
              }
            }}
            className={`block relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer mb-4 ${
              isDragOver
                ? 'border-forest bg-[#edf3e2]/70 scale-[1.01]'
                : 'border-stone-300 bg-stone-50/70 hover:bg-[#f7f9f3] hover:border-forest/60'
            }`}
          >
            <input
              id="property-multi-file-input"
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg,.png,.jpg,.jpeg,.webp"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                  e.target.value = '';
                }
              }}
              disabled={uploading || images.length >= 12}
            />

            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-stone-200/80 flex items-center justify-center mb-2.5 text-forest">
                <Upload size={22} className={uploading ? 'animate-bounce' : ''} />
              </div>

              <p className="text-sm font-bold text-stone-800">
                {uploading
                  ? uploadProgress || 'Uploading photos…'
                  : 'Drag & drop multiple property photos here, or click to browse'}
              </p>

              <p className="text-xs text-stone-500 mt-1">
                Select multiple photos at once with <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded font-mono text-[10px]">Ctrl</kbd> or <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded font-mono text-[10px]">Shift</kbd> (JPEG, PNG, WebP up to 5 MB each)
              </p>

              <div className="mt-3 pointer-events-auto">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest text-white text-xs font-bold shadow-xs hover:bg-[#12332c] transition">
                  <Upload size={14} />
                  Choose Multiple Photos
                </span>
              </div>
            </div>
          </label>

          {/* Paste HTTPS URL Alternative */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="url"
              value={photoLink}
              onChange={(e) => setPhotoLink(e.target.value)}
              placeholder="Or paste an HTTPS image URL (e.g. Unsplash, CDN)"
              className="input flex-1 !text-sm"
            />
            <button
              type="button"
              disabled={!photoLink.trim() || images.length >= 12}
              onClick={() => {
                try {
                  const url = new URL(photoLink.trim());
                  if (url.protocol !== 'https:') throw new Error();
                  setImages((v) => [...v, url.href]);
                  setPhotoLink('');
                } catch {
                  toast('Please provide a valid HTTPS image URL.');
                }
              }}
              className="btn-outline !min-h-0 !py-2 !px-4 !text-sm"
            >
              Add Link
            </button>
          </div>

          {/* Photos Header & Counter */}
          <div className="flex items-center justify-between text-xs text-stone-600 mb-2 font-medium">
            <span>
              Added Photos ({images.length} / 12)
            </span>
            {images.length > 0 && (
              <span className="text-[11px] text-stone-400">
                Tip: The first photo is your listing cover image
              </span>
            )}
          </div>

          {/* Image Previews Grid with Re-ordering & Remove */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((url, i) => (
              <div
                className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-video shadow-sm"
                key={`${url}-${i}`}
              >
                <Image
                  src={url}
                  alt={`Property photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImages((v) => v.filter((_, n) => n !== i));
                  }}
                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full shadow transition-colors"
                >
                  <X size={13} />
                </button>

                {i === 0 ? (
                  <span className="absolute bottom-1.5 left-1.5 bg-forest text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    #1 Cover Photo
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImages((prev) => [prev[i], ...prev.filter((_, n) => n !== i)]);
                    }}
                    className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 bg-black/75 hover:bg-forest text-white text-[10px] font-semibold px-2 py-0.5 rounded transition-all shadow"
                  >
                    Set as Cover
                  </button>
                )}
              </div>
            ))}
          </div>

          {images.length === 0 && (
            <div className="p-4 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-center text-xs text-stone-500 mt-2">
              At least one photo is required. Drag & drop files above or click &quot;Add Sample Photos&quot;.
            </div>
          )}
        </div>

        {/* ── SECTION 9: SUBMISSION ACTION ── */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-200">
          <p className="text-xs text-stone-500">
            {item
              ? 'Edits are verified by moderators before appearing publicly.'
              : 'New listings are reviewed by an administrator within 2 hours.'}
          </p>

          <Submit busy={busy || uploading || !images.length}>
            {item ? 'Save & Submit Changes' : 'Publish Property for Review'}
          </Submit>
        </div>
      </form>

      {/* Security Captcha Modal */}
      <CaptchaModal
        isOpen={showCaptcha}
        onClose={() => setShowCaptcha(false)}
        onSuccess={doFinalSubmit}
        actionTitle={item ? 'Save & Submit Changes' : 'Publish Property for Review'}
      />
    </div>
  );
}
