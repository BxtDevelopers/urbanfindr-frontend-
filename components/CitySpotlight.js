
'use client';

import { useState } from 'react';
import {
  MapPin,
  Phone,
  User,
  Shield,
  Star,
} from 'lucide-react';
import { useApp, api } from './providers';

export default function CitySpotlight({ city }) {
  const { user, toast } = useApp();

  const [intent, setIntent] = useState('buy');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    locality: city?.localities?.[0] || '',
    budget: '',
  });

  if (!city) return null;

  const intents = [
    { value: 'buy', label: 'Buy' },
    { value: 'rent', label: 'Rent' },
    { value: 'pg', label: 'PG / Co-living' },
    { value: 'commercial', label: 'Commercial' },
  ];

  function change(event) {
    const { name, value } = event.target;

    setForm(current => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const phone = form.phone.replace(/\s/g, '');

    if (!name || !phone) {
      toast?.('Please enter your name and phone number.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast?.('Enter a valid 10-digit mobile number.');
      return;
    }

    setBusy(true);

    try {
      await api('leads', {
        method: 'POST',
        body: {
          kind: 'project',
          name,
          phone,
          city: city.name,
          note: [
            'Builder page Spotlight enquiry',
            `Requirement: ${
              intents.find(item => item.value === intent)?.label || intent
            }`,
            `Locality: ${form.locality || 'Not specified'}`,
            `Budget: ${form.budget || 'Not specified'}`,
          ].join(' | '),
          budget: form.budget || '0',
          homeSize: '2 BHK',
          service: 'Full home',
          finish: 'Essential',
        },
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Unable to submit Spotlight enquiry:', error);
      toast?.('Unable to submit your request. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setSubmitted(false);
    setIntent('buy');
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      locality: city?.localities?.[0] || '',
      budget: '',
    });
  }

  return (
    <section className="city-spotlight">
      <img
        src={city.image}
        alt={`${city.name} real estate`}
        className="city-spotlight-bg"
      />

      <div className="city-spotlight-overlay" />

      <div className="city-spotlight-inner wrap">
        <div className="city-spotlight-copy">
          <p className="city-spotlight-eyebrow">
            ✦ CITY SPOTLIGHT
          </p>

          <h2 className="city-spotlight-title">
            Find Your Perfect Home
            <br />
            <span>in {city.name}</span>
          </h2>

          <p className="city-spotlight-desc">
            {city.tagline ||
              `Explore builder projects and find your next home in ${city.name}.`}
          </p>

          <div className="city-spotlight-trust">
            <div className="city-spotlight-trust-item">
              <Star size={15} />
              <span>Zero brokerage</span>
            </div>

            <div className="city-spotlight-trust-item">
              <Shield size={15} />
              <span>Verified listings</span>
            </div>

            <div className="city-spotlight-trust-item">
              <Phone size={15} />
              <span>Free expert call</span>
            </div>
          </div>
        </div>

        <div className="city-spotlight-card">
          {submitted ? (
            <div className="city-spotlight-success">
              <div className="city-spotlight-success-icon">
                ✓
              </div>

              <h3>Request Received!</h3>

              <p>
                Thank you! Your enquiry for {city.name} has been submitted.
                Our team will contact you if your request is received
                successfully.
              </p>

              <button
                type="button"
                className="city-spotlight-reset"
                onClick={resetForm}
              >
                Submit another request
              </button>
            </div>
          ) : (
            <>
              <div className="city-spotlight-card-header">
                <p className="city-spotlight-card-title">
                  Book a Free Expert Consultation
                </p>

                <p className="city-spotlight-card-sub">
                  Tell us what kind of property you are looking for.
                </p>
              </div>

              <div className="city-spotlight-intents">
                {intents.map(item => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setIntent(item.value);
                      setForm(current => ({
                        ...current,
                        budget: '',
                      }));
                    }}
                    className={`city-spotlight-intent-btn ${
                      intent === item.value ? 'active' : ''
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleSubmit}
                className="city-spotlight-form"
              >
                <div className="city-spotlight-field">
                  <User
                    size={15}
                    className="city-spotlight-field-icon"
                  />

                  <input
                    name="name"
                    value={form.name}
                    onChange={change}
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="city-spotlight-field">
                  <span className="city-spotlight-dial">
                    +91
                  </span>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={change}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    autoComplete="tel"
                    inputMode="numeric"
                    required
                  />
                </div>

                <div className="city-spotlight-field">
                  <MapPin
                    size={15}
                    className="city-spotlight-field-icon"
                  />

                  <select
                    name="locality"
                    value={form.locality}
                    onChange={change}
                  >
                    <option value="">Preferred locality</option>

                    {(city.localities || []).map(locality => (
                      <option key={locality} value={locality}>
                        {locality}
                      </option>
                    ))}

                    <option value="Anywhere">
                      Anywhere in {city.name}
                    </option>
                  </select>
                </div>

                <div className="city-spotlight-field">
                  <span className="city-spotlight-dial">
                    ₹
                  </span>

                  <select
                    name="budget"
                    value={form.budget}
                    onChange={change}
                  >
                    <option value="">
                      Maximum budget (optional)
                    </option>

                    {intent === 'buy' && (
                      <>
                        <option value="5000000">
                          Up to ₹50 Lakh
                        </option>
                        <option value="10000000">
                          Up to ₹1 Crore
                        </option>
                        <option value="20000000">
                          Up to ₹2 Crore
                        </option>
                        <option value="50000000">
                          ₹2 Crore+
                        </option>
                      </>
                    )}

                    {(intent === 'rent' || intent === 'pg') && (
                      <>
                        <option value="10000">
                          Up to ₹10,000 / month
                        </option>
                        <option value="25000">
                          Up to ₹25,000 / month
                        </option>
                        <option value="50000">
                          Up to ₹50,000 / month
                        </option>
                        <option value="100000">
                          ₹50,000+ / month
                        </option>
                      </>
                    )}

                    {intent === 'commercial' && (
                      <>
                        <option value="50000">
                          Up to ₹50,000 / month
                        </option>
                        <option value="200000">
                          Up to ₹2 Lakh / month
                        </option>
                        <option value="500000">
                          ₹2 Lakh+ / month
                        </option>
                      </>
                    )}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="city-spotlight-submit"
                >
                  {busy
                    ? 'Sending...'
                    : 'Get Expert Callback — Free'}
                </button>

                <p className="city-spotlight-privacy">
                  <Shield size={11} />
                  Your details are used to respond to your enquiry.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
