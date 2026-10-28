export function money(value) {const n=Number(value);return n>=1e7?`₹${(n/1e7).toFixed(2).replace(/\.00$/,'')} Cr`:n>=1e5?`₹${(n/1e5).toFixed(1).replace(/\.0$/,'')} L`:`₹${n.toLocaleString('en-IN')}`;}
export const date = v => new Date(v).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
export const cities = ['Bengaluru','Mumbai','Pune','Hyderabad','Chennai','Delhi','Gurugram','Delhi NCR'];
export const amenities = ['Lift','Power backup','Security','Gym','Swimming pool','Clubhouse','Children’s play area','Garden','Visitor parking','Water supply','Wi-Fi','Meals','Housekeeping'];

export const TIME_RANGE_OPTIONS = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: '6months', label: 'Last 6 Months' },
  { id: '9months', label: 'Last 9 Months' }
];

export function isWithinTimeRange(dateStr, range) {
  if (!range || range === 'all') return true;
  if (!dateStr) return false;
  const targetDate = new Date(dateStr);
  const time = targetDate.getTime();
  if (isNaN(time)) return false;
  const now = Date.now();
  const diff = now - time;
  if (diff < 0) return true;

  switch (range) {
    case 'today': {
      const isPast24h = diff <= 86400000;
      const nowDate = new Date(now);
      const isSameDay =
        targetDate.getFullYear() === nowDate.getFullYear() &&
        targetDate.getMonth() === nowDate.getMonth() &&
        targetDate.getDate() === nowDate.getDate();
      return isPast24h || isSameDay;
    }
    case '7days':
      return diff <= 7 * 86400000;
    case '30days':
      return diff <= 30 * 86400000;
    case '6months':
      return diff <= 182.5 * 86400000;
    case '9months':
      return diff <= 273.75 * 86400000;
    default:
      return true;
  }
}
