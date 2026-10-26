'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

const STORIES = [
  {
    id: 1,
    studio: 'Studio Haven',
    city: 'Bengaluru',
    specs: '3 BHK, ₹4.8 Lakhs',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
    quote: 'UrbanInteriors delivered exactly what they promised — flawless execution, on time and within budget.',
    timeline: '45 days',
    style: 'Contemporary',
    logoInitials: 'SH',
  },
  {
    id: 2,
    studio: 'Craftline Spaces',
    city: 'Hyderabad',
    specs: '3 BHK, ₹6.5 Lakhs',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
    quote: 'The experience was smooth, transparent, and totally hassle-free from 3D design to the final handover.',
    timeline: '30 days',
    style: 'Minimalist',
    logoInitials: 'CS',
  },
  {
    id: 3,
    studio: 'Aura Living Studio',
    city: 'Delhi NCR',
    specs: '4 BHK, ₹7.9 Lakhs',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    quote: 'Our design consultant captured our family vision with utmost precision. Material quality is top-notch.',
    timeline: '40 days',
    style: 'Modern Luxe',
    logoInitials: 'AL',
  },
  {
    id: 4,
    studio: 'Nordic Form Studio',
    city: 'Mumbai',
    specs: '2 BHK, ₹3.9 Lakhs',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
    quote: 'Space planning for our compact apartment was brilliant. Every inch is both functional and beautiful.',
    timeline: '35 days',
    style: 'Scandinavian',
    logoInitials: 'NF',
  },
  {
    id: 5,
    studio: 'Verve Design House',
    city: 'Pune',
    specs: '3 BHK, ₹5.4 Lakhs',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=900&q=80',
    quote: 'Milestone tracking and dedicated support kept us completely relaxed throughout the makeover process.',
    timeline: '42 days',
    style: 'Warm Minimal',
    logoInitials: 'VD',
  },
];

export default function InteriorStoriesCarousel() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    
    // Update active index based on scroll position
    const cardWidth = 360 + 24; // card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(STORIES.length - 1, Math.max(0, index)));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      checkScroll();
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 380;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const scrollToIndex = (index) => {
    if (!scrollRef.current) return;
    const cardWidth = 360 + 24;
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  };

  return (
    <section className="w-full bg-white py-16 sm:py-20 border-t border-stone-200/70" aria-label="Customer Makeover Stories">
      <div className="wrap">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="eyebrow !mb-2.5">REAL HOME TRANSFORMATIONS</p>
          <h2 className="!text-2xl sm:!text-3xl lg:!text-4xl font-extrabold text-[#1a221d] tracking-tight leading-tight mb-3">
            How UrbanInteriors Transformed Real Homes &amp; Spaces
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Hear from homeowners who partnered with our verified designers to create comfortable, practical, and inspiring homes.
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth no-scrollbar snap-x snap-mandatory"
        >
          {STORIES.map((item) => (
            <div
              key={item.id}
              className="w-[310px] sm:w-[350px] md:w-[370px] shrink-0 snap-start flex flex-col group cursor-pointer"
            >
              {/* Image Box with Overlay Information */}
              <div className="relative w-full h-[250px] sm:h-[275px] rounded-3xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200/80">
                <img
                  src={item.image}
                  alt={item.studio}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                />

                {/* Dark gradient shadow overlay */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

                {/* Bottom Overlay with Studio Logo & Specs */}
                <div className="absolute inset-x-4 bottom-4 flex items-center gap-3">
                  {/* Studio Logo Pill */}
                  <div className="w-11 h-11 rounded-xl bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center shrink-0 border border-stone-200/80">
                    <span className="font-black text-xs tracking-tight text-forest">
                      {item.logoInitials}
                    </span>
                  </div>

                  {/* Studio Name, City & Specs */}
                  <div className="text-white min-w-0">
                    <h3 className="font-bold text-sm sm:text-base leading-tight truncate drop-shadow-sm">
                      {item.studio}
                    </h3>
                    <p className="text-xs text-white/80 truncate drop-shadow-sm">
                      {item.city}
                    </p>
                    <p className="text-xs text-amber-200 font-semibold drop-shadow-sm">
                      {item.specs}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote / Testimonial */}
              <p className="text-stone-700 text-sm leading-relaxed my-3.5 px-1 min-h-[42px] line-clamp-2">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Badges / Chips */}
              <div className="flex items-center gap-2 mt-auto px-1">
                <span className="px-3 py-1 rounded-full text-xs font-semibold border border-[#d6b794]/80 text-[#8e5c2b] bg-[#fffcf9]">
                  {item.timeline}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold border border-[#d6b794]/80 text-[#8e5c2b] bg-[#fffcf9]">
                  {item.style}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls (Arrows & Dots) */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {/* Left Arrow */}
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous home stories"
            className="w-10 h-10 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft size={17} strokeWidth={2.2} />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {STORIES.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-200 rounded-full cursor-pointer ${
                  activeIndex === index
                    ? 'w-6 h-2 bg-[#a87034]'
                    : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Next home stories"
            className="w-10 h-10 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowRight size={17} strokeWidth={2.2} />
          </button>
        </div>

      </div>
    </section>
  );
}

