'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MAKEOVER_DATA = {
  'Living Room': {
    quote: '"Designed for moments that matter"',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',
        title: 'Modern Warm Living Lounge',
        caption: 'Soft ambient cove lighting and tailored sectional seating',
      },
      {
        url: '/photos/living-1.jpg',
        title: 'Contemporary Open Living Space',
        caption: 'Sleek wood accents and panoramic natural light',
      },
      {
        url: '/photos/living-2.jpg',
        title: 'Minimalist Scandinavian Hall',
        caption: 'Clean geometric lines with warm oak textures',
      },
      {
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85',
        title: 'Urban Chic Sitting Room',
        caption: 'Curated statement furniture and layered neutral rugs',
      },
      {
        url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85',
        title: 'Earthy Bohemian Sanctuary',
        caption: 'Textured fluted wall panels and organic ceramics',
      },
      {
        url: '/photos/interior-hero-bg.jpg',
        title: 'Golden Hour Accent Living',
        caption: 'Honey-amber walls with plush designer seating',
      },
    ],
  },
  'Bed Room': {
    quote: '"A sanctuary designed for restful nights & bright mornings"',
    images: [
      {
        url: '/photos/bedroom-1.jpg',
        title: 'Master Suite Retreat',
        caption: 'Upholstered acoustic headboard with integrated warm lighting',
      },
      {
        url: '/photos/bedroom-2.jpg',
        title: 'Serene Minimal Bedroom',
        caption: 'Neutral linen textures and custom floor-to-ceiling wardrobes',
      },
      {
        url: '/photos/bedroom-3.jpg',
        title: 'Sunlit Urban Bedroom',
        caption: 'Bespoke floating bedside tables and soft acoustic drapery',
      },
      {
        url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85',
        title: 'Japandi Calm Suite',
        caption: 'Natural ash wood finishes with concealed ambient cove light',
      },
      {
        url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1400&q=85',
        title: 'Warm Contemporary Master',
        caption: 'Plush velvet accents with warm bedside task lighting',
      },
    ],
  },
  'Kitchen': {
    quote: '"Where culinary passion meets ergonomic precision"',
    images: [
      {
        url: '/photos/kitchen-2.jpg',
        title: 'Contemporary Island Kitchen',
        caption: 'Quartz waterfall countertops with soft-close acrylic cabinetry',
      },
      {
        url: '/photos/kitchen-1.jpg',
        title: 'Modern Modular Kitchen',
        caption: 'Fluted glass overhead shutters with under-cabinet strip LEDs',
      },
      {
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=85',
        title: 'Matte Forest Modular Kitchen',
        caption: 'Deep forest green finishes with brass hardware and pantry pull-outs',
      },
      {
        url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1400&q=85',
        title: 'Scandinavian Breakfast Bar',
        caption: 'Light birch wood breakfast nook with seamless handleless drawers',
      },
    ],
  },
  'Bathroom': {
    quote: '"Spa-like tranquility engineered into every detail"',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=85',
        title: 'Luxe Marble Vanity Suite',
        caption: 'Backlit LED anti-fog mirror with wall-hung vanity counter',
      },
      {
        url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=85',
        title: 'Monochrome Modern Bath',
        caption: 'Matte black concealed thermostatic fittings and glass partition',
      },
      {
        url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1400&q=85',
        title: 'Warm Terrazzo Powder Room',
        caption: 'Handmade ceramic basin with subtle warm pendant lighting',
      },
    ],
  },
  'Kids Room': {
    quote: '"Spaces where imagination, play & study thrive together"',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1400&q=85',
        title: 'Creative Play & Study Room',
        caption: 'Modular ergonomic study desk with modular chalk and toy storage',
      },
      {
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=85',
        title: 'Montessori Bunk Bed Suite',
        caption: 'Rounded safety corners and playful neutral pastel color blocking',
      },
      {
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=85',
        title: 'Cozy Reading Nook & Bedroom',
        caption: 'Soft padded window bay seating with hidden book storage',
      },
    ],
  },
};

const CATEGORIES = ['Living Room', 'Bed Room', 'Kitchen', 'Bathroom', 'Kids Room'];

export default function InteriorMakeoverShowcase() {
  const [activeCategory, setActiveCategory] = useState('Living Room');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const currentCategoryData = MAKEOVER_DATA[activeCategory] || MAKEOVER_DATA['Living Room'];
  const images = currentCategoryData.images;
  const currentImage = images[activeImageIndex] || images[0];

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveImageIndex(0);
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="wrap section pt-4 pb-16" aria-label="Home Makeover Showcase">
      
      {/* Title & Subtitle */}
      <div className="text-center max-w-3xl mx-auto mb-7">
        <p className="eyebrow !mb-2.5">CURATED HOME MAKEOVERS</p>
        <h2 className="!text-2xl sm:!text-3xl lg:!text-4xl font-extrabold text-[#1a221d] tracking-tight leading-tight mb-3">
          Real Homes, Thoughtfully Reimagined.
        </h2>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Explore room transformations that balance personal warmth, smart functionality, and timeless design.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-8">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#a87034] text-white shadow-md shadow-[#a87034]/20 scale-102'
                  : 'bg-white text-stone-700 border border-stone-200/90 hover:border-stone-400 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Big Showcase Card */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-stone-900 shadow-xl group">
        
        {/* Big Image Display */}
        <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[540px]">
          <img
            key={currentImage.url}
            src={currentImage.url}
            alt={currentImage.title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Dark Gradient Overlay for the Quote */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

          {/* Quote Text */}
          <div className="absolute inset-x-4 bottom-6 sm:bottom-8 text-center pointer-events-none">
            <p className="text-white text-lg sm:text-2xl md:text-3xl font-bold tracking-tight drop-shadow-lg">
              {currentCategoryData.quote}
            </p>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1 drop-shadow-md">
              {currentImage.title} &bull; {currentImage.caption}
            </p>
          </div>

          {/* Left Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous makeover photo"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-stone-900 shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next makeover photo"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-stone-900 shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
          >
            <ChevronRight size={22} strokeWidth={2.4} />
          </button>
        </div>

      </div>

      {/* Thumbnail Navigation Strip */}
      <div className="mt-4 sm:mt-5 flex gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar justify-start sm:justify-center">
        {images.map((img, idx) => {
          const isSelected = idx === activeImageIndex;
          return (
            <button
              key={img.url}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={`relative shrink-0 w-20 h-14 sm:w-28 sm:h-20 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-3 ring-[#a87034] ring-offset-2 scale-105 opacity-100 shadow-md'
                  : 'opacity-65 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}
      </div>

    </section>
  );
}

