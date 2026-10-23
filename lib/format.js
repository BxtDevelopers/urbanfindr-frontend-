export function money(value) {const n=Number(value);return n>=1e7?`₹${(n/1e7).toFixed(2).replace(/\.00$/,'')} Cr`:n>=1e5?`₹${(n/1e5).toFixed(1).replace(/\.0$/,'')} L`:`₹${n.toLocaleString('en-IN')}`;}
export const date = v => new Date(v).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
export const cities = ['Bengaluru','Mumbai','Pune','Hyderabad','Chennai','Delhi','Gurugram','Delhi NCR'];
export const amenities = ['Lift','Power backup','Security','Gym','Swimming pool','Clubhouse','Children’s play area','Garden','Visitor parking','Water supply','Wi-Fi','Meals','Housekeeping'];
