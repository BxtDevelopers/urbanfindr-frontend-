'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare, PhoneCall, Sparkles } from 'lucide-react';

const FAQS = [
  {
    category: 'Process & Services',
    question: 'What is included in end-to-end home interior design services?',
    answer: 'Turnkey interior solutions cover comprehensive space planning, 3D floor plan visualizations, modular kitchen, bespoke wardrobes, false ceiling design, electrical & lighting layouts, wall treatments (textures, wallpapers, Asian Paints Royale paints), and premium hardware fittings. Everything is managed from concept to final move-in handover.',
  },
  {
    category: 'Cost & Budget',
    question: 'How much does home interior design typically cost for 1, 2, or 3 BHK?',
    answer: 'Indicative project pricing varies based on scope and finish tiers:\n• 1 BHK: ₹2.5 Lakhs – ₹4.0 Lakhs (Essential modular woodwork & storage)\n• 2 BHK: ₹4.5 Lakhs – ₹7.5 Lakhs (Complete modular kitchen, master wardrobes, TV unit & false ceiling)\n• 3 BHK / 4 BHK: ₹7.5 Lakhs – ₹14+ Lakhs (Full turnkey luxury woodwork, bespoke wall panelling & premium European fittings)\nAll quotes feature transparent, itemized material pricing with zero hidden charges.',
  },
  {
    category: 'Timeline & Delivery',
    question: 'What is the typical timeline for completing a home interior project?',
    answer: 'Standard modular woodwork (kitchens, wardrobes, TV consoles) is fabricated in automated factories and delivered within 45 days. Complete turnkey projects requiring civil changes, false ceilings, and painting typically take between 45 to 60 days following your final 3D design approval.',
  },
  {
    category: 'Warranty & Quality',
    question: 'What warranties and quality guarantees do you offer on materials?',
    answer: 'All partner brands provide up to a 10-year warranty on modular woodwork and core materials (BWP / BWR waterproof grade plywood). Hardware components from partners like Hettich and Häfele come with certified manufacturer warranties. Prior to handover, your project passes a 140+ point quality audit.',
  },
  {
    category: 'Process & Services',
    question: 'How does UrbanInteriors help me compare multiple design brands?',
    answer: 'UrbanInteriors connects you with India\'s top verified interior brands (including Asian Paints Beautiful Homes, Livspace, HomeLane, and boutique studios). You can review standardized quotations, examine material grades, compare 3D designs, and choose the team that best aligns with your budget and aesthetic preferences.',
  },
  {
    category: 'Customization',
    question: 'Can the designs be customized to my specific floor plan and style?',
    answer: 'Yes, 100% of our interior projects are custom-tailored. Your assigned design consultant works directly with your builder floor plan to maximize usable square footage, address storage pain points, and match your preferred theme—whether Scandinavian, Modern Contemporary, Minimalist, or Traditional Indian Luxe.',
  },
  {
    category: 'Payment & Safety',
    question: 'What is the payment schedule and how are milestone funds protected?',
    answer: 'Payments follow a secure milestone-based structure: an initial design token to begin customized 3D design, an installment upon design approval for factory fabrication, and the balance upon site delivery and quality inspection before handover.',
  },
  {
    category: 'Warranty & Quality',
    question: 'What happens if I need assistance or repairs after moving in?',
    answer: 'You receive dedicated post-handover support. Any servicing requirements during the warranty period are attended to by dedicated service technicians under our post-installation care program.',
  },
];

export default function InteriorFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(prev => prev === index ? null : index);
  };

  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24 border-t border-stone-200/80" aria-label="Frequently Asked Questions">
      <div className="wrap max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-[#edf2e2] text-forest border border-[#d6e2cd] px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 shadow-xs">
            <HelpCircle size={14} className="text-forest" />
            <span>Got Questions? We Have Answers</span>
          </div>

          <h2 className="!text-2xl sm:!text-3xl lg:!text-4xl font-extrabold text-forest tracking-tight leading-tight mb-3">
            Frequently Asked Questions
          </h2>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Everything you need to know about designing your dream home with our verified interior partners, pricing, timelines, and warranties.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`rounded-2xl transition-all duration-200 border overflow-hidden ${
                  isOpen
                    ? 'bg-[#fbfcf9] border-forest/40 shadow-sm'
                    : 'bg-white border-stone-200/90 hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                {/* Question Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-5 sm:px-6 py-4.5 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-forest" />
                    <span className="font-bold text-sm sm:text-base lg:text-[17px] text-forest tracking-tight">
                      {faq.question}
                    </span>
                  </div>

                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'bg-forest text-lime rotate-180' : 'bg-stone-100 text-stone-600'
                  }`}>
                    <ChevronDown size={17} strokeWidth={2.4} />
                  </span>
                </button>

                {/* Collapsible Answer Body */}
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm lg:text-base text-stone-700 leading-relaxed border-t border-stone-100/90 whitespace-pre-line animate-in fade-in-50 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help Banner */}
        <div className="mt-12 sm:mt-16 bg-[#edf2e2] border border-[#d6e2cd] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest text-lime flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-forest text-base sm:text-lg">
                Still have a question in mind?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Our design advisory team is ready to guide you through costs and consultations.
              </p>
            </div>
          </div>

          <a
            href="tel:+918001234567"
            className="bg-forest hover:bg-[#205246] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-xs transition shrink-0"
          >
            <PhoneCall size={15} />
            <span>Speak to a Design Expert</span>
          </a>
        </div>

      </div>
    </section>
  );
}

