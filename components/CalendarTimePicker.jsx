'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM'
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarTimePicker({ name = 'scheduledAt', value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('date'); // 'date' | 'time'
  const containerRef = useRef(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Selected date and time
  const [selectedDate, setSelectedDate] = useState(() => (value ? new Date(value) : null));
  const [selectedTime, setSelectedTime] = useState(() => {
    if (!value) return null;
    const d = new Date(value);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = (h % 12 || 12).toString().padStart(2, '0');
    return `${hour12}:${m} ${period}`;
  });

  // Calendar month & year view
  const [currentYear, setCurrentYear] = useState(() => (value ? new Date(value).getFullYear() : new Date().getFullYear()));
  const [currentMonth, setCurrentMonth] = useState(() => (value ? new Date(value).getMonth() : new Date().getMonth()));

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reset to date step when opening
  useEffect(() => {
    if (isOpen) {
      setStep('date');
    }
  }, [isOpen]);

  // Compute ISO string
  const isoString = useMemo(() => {
    if (!selectedDate || !selectedTime) return '';
    const match = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '';
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const d = new Date(selectedDate);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  }, [selectedDate, selectedTime]);

  // Calendar cells computation
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      cells.push({
        day,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, day)
      });
    }

    // Next month leading days
    const remaining = (7 - (cells.length % 7)) % 7;
    const targetLength = cells.length + remaining < 35 ? 35 : cells.length + remaining;
    const additional = targetLength - cells.length;
    for (let day = 1; day <= additional; day++) {
      cells.push({
        day,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, day)
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function handleSelectCell(cell) {
    setSelectedDate(cell.date);
    if (!cell.isCurrentMonth) {
      setCurrentYear(cell.date.getFullYear());
      setCurrentMonth(cell.date.getMonth());
    }
  }

  // Formatted trigger label
  const displayLabel = useMemo(() => {
    if (!selectedDate || !selectedTime) {
      return 'Select date and time';
    }
    const dayStr = selectedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    return `${dayStr} • ${selectedTime}`;
  }, [selectedDate, selectedTime]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Hidden input to pass ISO value into form submit */}
      <input type="hidden" name={name} value={isoString} required />

      {/* Input Field Trigger */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen);
        }}
        className="w-full text-xs bg-white border border-stone-200 hover:border-[#163e35] rounded-xl p-2.5 flex items-center justify-between text-left transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#163e35]"
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarDays size={15} className="text-[#059669] shrink-0" />
          <span
            className={`text-xs truncate ${
              !selectedDate || !selectedTime
                ? 'text-stone-400 font-normal'
                : 'font-semibold text-stone-900'
            }`}
          >
            {displayLabel}
          </span>
        </div>
        <div className="p-1 rounded bg-[#ecf2e4] text-[#163e35] hover:bg-[#d8edb3] transition-colors shrink-0">
          <CalendarIcon size={14} />
        </div>
      </div>

      {/* Small popover dropdown on the right side */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-[310px] sm:w-[325px] bg-white rounded-2xl border border-stone-200 shadow-2xl p-3.5 animate-in fade-in slide-in-from-top-2">
          
          {/* STEP 1: DATE SELECTION */}
          {step === 'date' && (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between px-1">
                <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <CalendarCheck size={14} className="text-[#059669]" />
                  <span>Select Date</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Calendar Month Navigation */}
              <div className="bg-stone-50/70 border border-stone-200/80 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-2 px-1">
                  <button
                    type="button"
                    onClick={prevMonth}
                    aria-label="Previous Month"
                    className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="font-bold text-xs text-stone-900">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    aria-label="Next Month"
                    className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors cursor-pointer"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {DAY_LABELS.map((d) => (
                    <span key={d} className="text-[10px] font-semibold text-stone-400">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Day Cells Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarCells.map((cell, idx) => {
                    const cellTime = cell.date.getTime();
                    const isToday = cellTime === today.getTime();
                    const isSelected =
                      selectedDate &&
                      cell.date.getFullYear() === selectedDate.getFullYear() &&
                      cell.date.getMonth() === selectedDate.getMonth() &&
                      cell.date.getDate() === selectedDate.getDate();
                    const isPast = cellTime < today.getTime();

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isPast}
                        onClick={() => handleSelectCell(cell)}
                        className={`w-7 h-7 mx-auto text-xs rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#163e35] text-white font-bold shadow-xs'
                            : isToday
                            ? 'border border-[#059669] text-[#059669] font-bold'
                            : !cell.isCurrentMonth
                            ? 'text-stone-300 font-normal hover:bg-stone-100'
                            : isPast
                            ? 'text-stone-300 cursor-not-allowed'
                            : 'text-stone-800 font-medium hover:bg-stone-200/70'
                        }`}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Selected Feedback & Continue Button */}
              <div className="space-y-2 pt-1 border-t border-stone-100">
                <div className="text-[11px] text-stone-500 text-center truncate">
                  {selectedDate ? (
                    <span>
                      Date:{' '}
                      <strong className="text-stone-900">
                        {selectedDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </strong>
                    </span>
                  ) : (
                    <span className="text-stone-400">Choose a date to continue</span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!selectedDate}
                  onClick={() => setStep('time')}
                  className={`w-full py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedDate
                      ? 'bg-[#163e35] hover:bg-[#24564a] text-white'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TIME SELECTION */}
          {step === 'time' && (
            <div className="space-y-3">
              {/* Header with Back button */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <button
                  type="button"
                  onClick={() => setStep('date')}
                  className="flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-[#163e35] cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>
                <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <Clock size={13} className="text-[#059669]" />
                  <span>Select Time</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Selected Date Summary Badge */}
              <div className="bg-[#ecf2e4] text-[#163e35] px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between">
                <span>
                  {selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="text-[10px] uppercase tracking-wide opacity-80">Chosen Date</span>
              </div>

              {/* Time Slots (2 Columns, Compact) */}
              <div className="max-h-52 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                <div className="grid grid-cols-2 gap-1.5">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-2 text-xs rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#163e35] text-white border-[#163e35] font-bold shadow-xs'
                            : 'bg-white text-stone-800 border-stone-200 font-medium hover:border-[#163e35] hover:bg-stone-50'
                        }`}
                      >
                        <span>{slot}</span>
                        {isSelected && (
                          <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shrink-0 ml-1.5 shadow-2xs">
                            <Check size={9} className="text-[#163e35] stroke-[3.5]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary & Done Button */}
              <div className="space-y-2 pt-1 border-t border-stone-100">
                <div className="text-[11px] text-stone-500 text-center truncate">
                  {selectedTime ? (
                    <span>
                      Selected:{' '}
                      <strong className="text-stone-900 font-bold">{selectedTime}</strong>
                    </span>
                  ) : (
                    <span className="text-stone-400">Pick a time slot</span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!selectedTime}
                  onClick={() => setIsOpen(false)}
                  className={`w-full py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedTime
                      ? 'bg-[#059669] hover:bg-[#047857] text-white'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <Check size={14} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
