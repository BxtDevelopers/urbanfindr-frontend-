'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api, useApp, useData } from './providers';
import { Field, Image, State, Submit } from './ui';
import { cities, amenities } from '@/lib/format';
import { categoryFor } from '@/lib/catalog';
import { propertyGallery, propertyImages } from '@/lib/media';

export default function PropertyEditor({ id, initialPurpose, initialCity, initialLocality, onBack }) {
  const { data, error, loading } = useData(id ? `properties/${id}` : null);
  if (id && (loading || !data)) return <div className="wrap section"><State loading={loading} error={error} /></div>;
  return (
    <Editor
      key={id || `${initialPurpose}-${initialCity}-${initialLocality}` || 'new'}
      item={data}
      initialPurpose={initialPurpose}
      initialCity={initialCity}
      initialLocality={initialLocality}
      onBack={onBack}
    />
  );
}

function Editor({ item, initialPurpose, initialCity, initialLocality, onBack }) {
  const router = useRouter(), { toast } = useApp();
  const [purpose, setPurpose] = useState(item?.purpose || initialPurpose || 'rent');
  const [type, setType] = useState(item?.type || categoryFor(initialPurpose || 'rent').types[0]);
  const [images, setImages] = useState(item ? propertyImages(item) : []);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [photoLink, setPhotoLink] = useState('');

  async function upload(e) {
    setUploading(true);
    try {
      const urls = [];
      for (const file of Array.from(e.target.files).slice(0, 12 - images.length)) {
        const data = new FormData();
        data.append('file', file);
        const result = await api('uploads', { method: 'POST', body: data });
        urls.push(result.url);
      }
      setImages(v => [...v, ...urls].slice(0, 12));
    } catch (e) {
      toast(e.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const input = Object.fromEntries(form);
    delete input.photos;
    input.images = images;
    input.parking = form.get('parking') === 'on';
    input.mealsIncluded = form.get('mealsIncluded') === 'on';
    input.amenities = form.getAll('amenities');
    try {
      await api(item ? `properties/${item._id}` : 'properties', {
        method: item ? 'PATCH' : 'POST',
        body: input,
      });
      toast('Your listing is saved and submitted for review.');
      router.push('/dashboard/properties');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap pb-20 max-w-4xl">
      {onBack && (
        <div className="pt-8">
          <button
            type="button"
            onClick={onBack}
            className="btn-outline !min-h-0 !py-2 !px-3.5 !text-sm inline-flex items-center gap-2 hover:bg-forest hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to Step 1 (Basic Details)
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 pt-6 pb-2 text-sm">
        <span className="flex items-center gap-1.5 text-forest font-semibold">
          <CheckCircle2 size={18} className="text-forest" />
          <span>Step 1: Property Type &amp; Contact</span>
        </span>
        <span className="text-muted font-bold">→</span>
        <span className="flex items-center gap-1.5 text-forest font-bold bg-lime/60 px-3 py-1 rounded-full">
          <span className="w-5 h-5 rounded-full bg-forest text-white text-xs flex items-center justify-center font-bold">2</span>
          <span>Step 2: Specifications, Pricing &amp; Photos</span>
        </span>
      </div>

      <div className="page-heading !pt-4">
        <p className="eyebrow">YOUR PROPERTY. THEIR NEXT CHAPTER.</p>
        <h1>{item ? 'Fine-tune your listing.' : 'Open the door to possibilities.'}</h1>
        <p className="muted mt-3">
          Every great match starts with a clear, honest listing. Owner edits are reviewed before publishing.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {error && (
          <div className="error whitespace-pre-line" role="alert">
            {error}
          </div>
        )}

        <div className="panel">
          <h3 className="mb-6">Start with the essentials</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Listing title">
              <input
                name="title"
                defaultValue={item?.title}
                required
                minLength={8}
                maxLength={150}
                placeholder="A light-filled 2 BHK in Indiranagar"
              />
            </Field>

            <Field label="List for">
              <select
                name="purpose"
                value={purpose}
                onChange={e => {
                  setPurpose(e.target.value);
                  setType(categoryFor(e.target.value).types[0]);
                }}
              >
                <option value="rent">Rent</option>
                <option value="buy">Sell</option>
                <option value="pg">PG / Co-living</option>
                <option value="commercial">Commercial — sale or lease</option>
              </select>
            </Field>

            <Field label="Property type">
              <select name="type" value={type} onChange={e => setType(e.target.value)}>
                {categoryFor(purpose).types.map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="City">
              <select name="city" defaultValue={item?.city || initialCity || 'Bengaluru'}>
                {cities.map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Locality">
              <input
                name="locality"
                required
                minLength={2}
                maxLength={120}
                defaultValue={item?.locality || initialLocality || ''}
                placeholder="e.g. Indiranagar, Whitefield"
              />
            </Field>

            <Field label="Address">
              <input
                name="address"
                required
                minLength={5}
                maxLength={300}
                defaultValue={item?.address}
                placeholder="Building / House name, Street, Landmark"
              />
            </Field>
          </div>
        </div>

        <div className="panel">
          <h3 className="mb-6">The details that make a difference</h3>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              ['price', purpose === 'buy' ? 'Asking price (₹)' : purpose === 'commercial' ? 'Price (₹) — according to transaction type' : 'Monthly rent (₹)', 1, item?.price],
              ['deposit', 'Security deposit (₹)', 0, item?.deposit || 0],
              ['maintenance', 'Monthly maintenance (₹)', 0, item?.maintenance || 0],
              ['area', 'Built-up area (sq ft)', 1, item?.area],
              ['bedrooms', 'Bedrooms (0 for non-residential)', 0, item?.bedrooms || 0],
              ['bathrooms', 'Bathrooms', 0, item?.bathrooms || 0],
            ].map(([name, label, min, value]) => (
              <Field key={name} label={label}>
                <input
                  type="number"
                  name={name}
                  required
                  min={min}
                  max={name === 'bedrooms' || name === 'bathrooms' ? 20 : 1e12}
                  defaultValue={value}
                />
              </Field>
            ))}

            <Field label="Furnishing">
              <select name="furnishing" defaultValue={item?.furnishing || 'Unfurnished'}>
                {['Unfurnished', 'Semi-furnished', 'Fully furnished'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Available from">
              <input
                name="availableFrom"
                required
                type="date"
                defaultValue={item?.availableFrom?.slice(0, 10) || new Date().toISOString().slice(0, 10)}
              />
            </Field>

            <Field label="Preferred tenants">
              <select name="preferredTenant" defaultValue={item?.preferredTenant || 'Anyone'}>
                {['Anyone', 'Family', 'Bachelors', 'Women', 'Men'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
          </div>

          <label className="check-label mt-5">
            <input type="checkbox" name="parking" defaultChecked={item?.parking} />
            Parking available
          </label>

          {purpose === 'commercial' && (
            <div className="mt-5 max-w-sm">
              <Field label="Commercial transaction">
                <select name="transaction" defaultValue={item?.transaction || 'lease'}>
                  <option value="lease">Lease / monthly rent</option>
                  <option value="sale">Sale / total asking price</option>
                </select>
              </Field>
            </div>
          )}

          {purpose === 'pg' && (
            <div className="grid sm:grid-cols-3 gap-5 mt-5">
              <Field label="Room sharing">
                <select name="sharing" defaultValue={item?.sharing || 'Private room'}>
                  {['Private room', '2 sharing', '3 sharing', '4+ sharing'].map(v => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>

              <Field label="Available beds">
                <input
                  type="number"
                  name="availableBeds"
                  min="0"
                  max="500"
                  required
                  defaultValue={item?.availableBeds ?? 1}
                />
              </Field>

              <label className="check-label pt-5">
                <input type="checkbox" name="mealsIncluded" defaultChecked={item?.mealsIncluded} />
                Meals included in rent
              </label>
            </div>
          )}

          <div className="divider" />

          <Field label="Tell the home’s story">
            <textarea
              name="description"
              required
              minLength={30}
              maxLength={5000}
              defaultValue={item?.description}
              placeholder="What’s special about the space, neighbourhood and everyday life here?"
            />
          </Field>

          <div className="flex gap-4 flex-wrap mt-5">
            {amenities.map(v => (
              <label className="check-label" key={v}>
                <input name="amenities" value={v} type="checkbox" defaultChecked={item?.amenities?.includes(v)} />
                {v}
              </label>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Let your space do the talking</h3>
          <p className="muted text-sm mt-3 mb-5">
            Add up to 12 JPEG, PNG or WebP images, each up to 5 MB.
          </p>

          <label className="btn-outline cursor-pointer">
            <Upload size={16} />
            {uploading ? 'Uploading…' : 'Upload photos'}
            <input
              className="hidden"
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={upload}
              disabled={uploading || images.length >= 12}
            />
          </label>

          <button
            type="button"
            className="text-link ml-5"
            disabled={images.length >= 12}
            onClick={() => setImages(v => [...v, propertyGallery({ purpose, type }, v.length)[0]])}
          >
            Use a sample photo
          </button>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <input
              className="input"
              type="url"
              value={photoLink}
              onChange={e => setPhotoLink(e.target.value)}
              placeholder="Paste an HTTPS property image link"
              aria-label="Property image URL"
            />
            <button
              className="btn-outline"
              type="button"
              disabled={!photoLink.trim() || images.length >= 12}
              onClick={() => {
                try {
                  const url = new URL(photoLink.trim());
                  if (url.protocol !== 'https:') throw new Error();
                  setImages(v => [...v, url.href]);
                  setPhotoLink('');
                } catch {
                  toast('Use a valid HTTPS image link.');
                }
              }}
            >
              Add image link
            </button>
          </div>

          <p className="muted text-xs mt-2">
            Uploaded files and bundled photos work locally. External image links require internet and permission from the image host.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {images.map((url, i) => (
              <div className="relative" key={`${url}-${i}`}>
                <Image className="h-28 w-full object-cover rounded" src={url} alt={`Property photo ${i + 1}`} />
                <button
                  aria-label={`Remove image ${i + 1}`}
                  className="icon-btn absolute right-1 top-1"
                  type="button"
                  onClick={() => setImages(v => v.filter((_, n) => n !== i))}
                >
                  <X size={14} />
                </button>
                {i === 0 && <span className="badge absolute bottom-1 left-1">Cover</span>}
              </div>
            ))}
          </div>

          {images.length === 0 && <p className="text-xs muted mt-4">At least one photo is required.</p>}
        </div>

        <div className="flex justify-between items-center gap-4">
          <p className="text-xs muted">Listings are reviewed by an administrator.</p>
          <Submit busy={busy || uploading || !images.length}>
            {item ? 'Save & submit for review' : 'Publish for review'}
          </Submit>
        </div>
      </form>
    </div>
  );
}
