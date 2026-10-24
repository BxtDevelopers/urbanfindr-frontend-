'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { PropertyCard, State } from './ui';

export default function VerifiedPropertiesCarousel({
  items = [],
  loading = false,
  error = '',
  total = 0,
}) {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const singleWidthRef = useRef(0);
  const singleCountRef = useRef(0);

  // Interaction & animation refs
  const isHoveredRef = useRef(false);
  const isInteractingRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const lastTimeRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const buttonAnimIdRef = useRef(null);
  const interactionTimerRef = useRef(null);

  // If there are few items, duplicate them to ensure at least 8 items in the base set
  // This guarantees seamless loop coverage across wide and ultra-wide screens.
  const baseItems = [];
  if (items && items.length > 0) {
    let temp = [...items];
    while (temp.length < 8) {
      temp = [...temp, ...items];
    }
    baseItems.push(...temp);
  }

  // 3 duplicate sets: [Set 1, Set 2, Set 3]
  // Set 1 (buffer for left scroll), Set 2 (main view), Set 3 (buffer for right scroll)
  const allCards = baseItems.length > 0
    ? [...baseItems, ...baseItems, ...baseItems]
    : [];
  const singleSetCount = baseItems.length;
  singleCountRef.current = singleSetCount;

  // Seamless wrap logic: keeps scroll position bounded in Set 2 seamlessly
  const checkWrap = useCallback(() => {
    const container = containerRef.current;
    const singleWidth = singleWidthRef.current;
    if (!container || !singleWidth || singleWidth <= 0) return;

    // Scrolled into Set 3 -> subtract 1 set width (teleports seamlessly back to Set 2)
    if (container.scrollLeft >= singleWidth * 2) {
      container.scrollLeft -= singleWidth;
      if (isMouseDownRef.current) {
        startScrollLeftRef.current -= singleWidth;
      }
    }
    // Scrolled back into Set 1 -> add 1 set width (teleports seamlessly back to Set 2)
    else if (container.scrollLeft <= singleWidth * 0.5) {
      container.scrollLeft += singleWidth;
      if (isMouseDownRef.current) {
        startScrollLeftRef.current += singleWidth;
      }
    }
  }, []);

  // Measure single set width accurately
  const measureWidth = useCallback(() => {
    const container = containerRef.current;
    if (!container || singleCountRef.current === 0) return;

    const firstCard = cardRefs.current[0];
    const secondSetFirstCard = cardRefs.current[singleCountRef.current];

    if (firstCard && secondSetFirstCard) {
      const measured = secondSetFirstCard.offsetLeft - firstCard.offsetLeft;
      if (measured > 0) {
        const prevWidth = singleWidthRef.current;
        singleWidthRef.current = measured;

        if (container.scrollLeft === 0) {
          container.scrollLeft = measured;
        } else if (prevWidth > 0 && prevWidth !== measured) {
          // Adjust scroll position proportionally on resize
          container.scrollLeft = (container.scrollLeft / prevWidth) * measured;
        }
      }
    }
  }, []);

  // Initialize and observe resize
  useEffect(() => {
    if (allCards.length === 0) return;

    // Give DOM a frame to compute styles
    const timer = setTimeout(() => {
      measureWidth();
    }, 60);

    const handleResize = () => {
      measureWidth();
    };

    window.addEventListener('resize', handleResize);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        measureWidth();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [allCards.length, measureWidth]);

  // Continuous auto-scrolling loop using requestAnimationFrame
  useEffect(() => {
    if (allCards.length === 0) return;

    const SPEED_PX_PER_SEC = 35; // Calm, readable showcase speed

    const loop = (timestamp) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const elapsed = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Only scroll when not paused by hover or interaction
      const isPaused =
        isHoveredRef.current ||
        isInteractingRef.current ||
        isMouseDownRef.current;

      if (!isPaused && containerRef.current && singleWidthRef.current > 0) {
        const deltaSec = elapsed / 1000;
        // Safeguard against background tab pauses (skip huge deltas)
        if (deltaSec > 0 && deltaSec < 0.1) {
          containerRef.current.scrollLeft += deltaSec * SPEED_PX_PER_SEC;
          checkWrap();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (buttonAnimIdRef.current) {
        cancelAnimationFrame(buttonAnimIdRef.current);
      }
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
    };
  }, [allCards.length, checkWrap]);

  // Smooth ease-out scrolling for Prev / Next buttons
  const smoothScrollBy = useCallback((distance) => {
    const container = containerRef.current;
    if (!container) return;

    isInteractingRef.current = true;
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    if (buttonAnimIdRef.current) cancelAnimationFrame(buttonAnimIdRef.current);

    const startTime = performance.now();
    const duration = 400; // ms
    let prevEase = 0;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      const stepDelta = distance * (ease - prevEase);
      prevEase = ease;

      container.scrollLeft += stepDelta;
      checkWrap();

      if (progress < 1) {
        buttonAnimIdRef.current = requestAnimationFrame(animate);
      } else {
        buttonAnimIdRef.current = null;
        interactionTimerRef.current = setTimeout(() => {
          isInteractingRef.current = false;
          lastTimeRef.current = null;
        }, 1800);
      }
    };

    buttonAnimIdRef.current = requestAnimationFrame(animate);
  }, [checkWrap]);

  const handlePrev = () => {
    const singleWidth = singleWidthRef.current;
    const count = singleCountRef.current;
    if (!singleWidth || count === 0) return;
    const cardStep = singleWidth / count;
    smoothScrollBy(-cardStep);
  };

  const handleNext = () => {
    const singleWidth = singleWidthRef.current;
    const count = singleCountRef.current;
    if (!singleWidth || count === 0) return;
    const cardStep = singleWidth / count;
    smoothScrollBy(cardStep);
  };

  // Mouse Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only primary mouse button
    const container = containerRef.current;
    if (!container) return;

    if (buttonAnimIdRef.current) cancelAnimationFrame(buttonAnimIdRef.current);
    isMouseDownRef.current = true;
    startXRef.current = e.pageX;
    startScrollLeftRef.current = container.scrollLeft;
    hasDraggedRef.current = false;
    isInteractingRef.current = true;
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const dx = e.pageX - startXRef.current;
    if (Math.abs(dx) > 6) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = startScrollLeftRef.current - dx;
    checkWrap();
  };

  const handleMouseUpOrLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      interactionTimerRef.current = setTimeout(() => {
        isInteractingRef.current = false;
        lastTimeRef.current = null;
      }, 1800);
    }
  };

  // Intercept click on children if the user dragged
  const handleClickCapture = (e) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = () => {
    if (buttonAnimIdRef.current) cancelAnimationFrame(buttonAnimIdRef.current);
    isInteractingRef.current = true;
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
  };

  const handleTouchEnd = () => {
    interactionTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      lastTimeRef.current = null;
    }, 1800);
  };

  return (
    <div className="w-full">
      {/* Section Header with integrated Prev/Next navigation */}
      <div className="section-title flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow !mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-forest rounded-full" />
            REVIEWED BY OUR TEAM
          </p>
          <h2 className="!text-2xl sm:!text-3xl lg:!text-4xl font-semibold text-forest tracking-tight">
            Verified direct owner properties
          </h2>
          <p className="muted text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            All listings are thoroughly reviewed for authentic ownership, pricing, and clear documentation.
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0 self-start md:self-end">
          <Link
            className="text-link text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 hover:text-forest"
            href="/properties?verified=true"
          >
            <span>Browse all verified homes</span>
            <ArrowUpRight size={16} />
          </Link>

          {/* Left / Right Carousel Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous verified property"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-stone-300/80 bg-white hover:bg-cream hover:border-forest/50 active:scale-95 text-forest flex items-center justify-center transition-all shadow-sm"
              title="Previous"
            >
              <ChevronLeft size={18} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next verified property"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-stone-300/80 bg-white hover:bg-cream hover:border-forest/50 active:scale-95 text-forest flex items-center justify-center transition-all shadow-sm"
              title="Next"
            >
              <ChevronRight size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading & Empty States */}
      <State loading={loading} error={error} empty={total === 0 || (!loading && items.length === 0)} />

      {/* Infinite Carousel Container */}
      {!loading && allCards.length > 0 && (
        <div
          className="relative group mt-4 overflow-visible"
          onMouseEnter={() => {
            isHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveredRef.current = false;
            lastTimeRef.current = null;
            handleMouseUpOrLeave();
          }}
        >
          {/* Floating Navigation Button - Left (Desktop hover) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous verified properties"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-forest shadow-[0_6px_20px_rgba(22,62,53,0.18)] border border-stone-200/90 items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 backdrop-blur-sm cursor-pointer"
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>

          {/* Floating Navigation Button - Right (Desktop hover) */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next verified properties"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-forest shadow-[0_6px_20px_rgba(22,62,53,0.18)] border border-stone-200/90 items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 backdrop-blur-sm cursor-pointer"
          >
            <ChevronRight size={20} strokeWidth={2.4} />
          </button>

          {/* Scrolling Track Container */}
          <div
            ref={containerRef}
            onScroll={checkWrap}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onClickCapture={handleClickCapture}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onDragStart={(e) => e.preventDefault()}
            className="flex gap-6 overflow-x-auto no-scrollbar select-none py-4 -my-4 cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {allCards.map((item, idx) => (
              <div
                key={`${item._id}-${idx}`}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className="flex-none shrink-0 w-[86%] sm:w-[calc(50%-12px)] lg:w-[calc(33.3333%-16px)] transition-transform duration-200"
              >
                <PropertyCard item={item} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
