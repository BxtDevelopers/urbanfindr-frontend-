import { z } from 'zod';
const text = (min = 1, max = 200) => z.string().trim().min(min).max(max);
const money = z.coerce.number().finite().positive().max(1e12);
const nonNegative = z.coerce.number().finite().min(0).max(1e10);
export const imageURL = z.string().max(1000).refine(v => /^\/uploads\/[a-f0-9-]+\.(jpg|png|webp)$/.test(v) || /^\/images\/[a-z0-9-]+\.svg$/.test(v) || /^\/photos\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/.test(v) || /^https:\/\//.test(v), 'Use an HTTPS URL or an uploaded image');
export const registerSchema = z.object({ name: text(2,80), email: z.email().max(200).transform(v => v.toLowerCase()), password: z.string().min(10).max(100).refine(v => new TextEncoder().encode(v).length <= 72, 'Password must be at most 72 UTF-8 bytes'), phone: z.string().regex(/^\+?[\d\s-]{10,16}$/), role: z.enum(['user','owner','broker','builder','channel_partner']).default('user'), company: z.string().trim().max(100).optional(), reraId: z.string().trim().max(100).optional() });
export const loginSchema = z.object({ email: z.email().max(200).transform(v => v.toLowerCase()), password: z.string().min(1).max(100) });
export const propertySchema = z.object({
  title: text(8,150), description: text(30,5000), purpose: z.enum(['buy','rent','pg','commercial']),
  type: z.enum(['Apartment','Villa','Independent house','Plot','PG','Office','Shop','Warehouse']),
  city: text(2,80), locality: text(2,120), address: text(5,300), price: money,
  deposit: nonNegative.default(0), maintenance: nonNegative.default(0), bedrooms: z.coerce.number().int().min(0).max(20), bathrooms: z.coerce.number().int().min(0).max(20),
  area: money, furnishing: z.enum(['Unfurnished','Semi-furnished','Fully furnished']),
  availableFrom: z.iso.date(), preferredTenant: text(2,60).default('Anyone'), parking: z.boolean().default(false),
  amenities: z.array(text(1,60)).max(25), images: z.array(imageURL).min(1).max(12),
  ownership: z.enum(['owner','broker','builder','channel_partner']).default('owner'),
  propertyAge: z.enum(['Newly built','Resale','Older property']).default('Newly built'),
  transaction: z.enum(['sale','lease']).default('lease'),
  sharing: z.enum(['Private room','2 sharing','3 sharing','4+ sharing']).default('Private room'),
  mealsIncluded: z.boolean().default(false), availableBeds: z.coerce.number().int().min(0).max(500).default(1)
}).superRefine((value, ctx) => {
  if (value.purpose === 'pg' && value.type !== 'PG') ctx.addIssue({ code: 'custom', path: ['type'], message: 'PG listings must use the PG property type' });
  if (value.purpose === 'commercial' && !['Office','Shop','Warehouse'].includes(value.type)) ctx.addIssue({ code: 'custom', path: ['type'], message: 'Choose Office, Shop or Warehouse for commercial listings' });
  if (['buy','rent'].includes(value.purpose) && ['PG','Office','Shop','Warehouse'].includes(value.type)) ctx.addIssue({ code: 'custom', path: ['type'], message: 'Choose a residential property type' });
});
export const projectSchema = z.object({
  title: text(4,150), builder: text(2,100), city: text(2,80), locality: text(2,120), description: text(30,5000),
  price: money, maxPrice: money, area: money, acres: money, units: z.coerce.number().int().positive(), towers: z.coerce.number().int().positive(),
  rera: text(3,120), possession: text(4,80), stage: z.enum(['New launch','Under construction','Ready to move']),
  amenities: z.array(text(1,60)).max(25), images: z.array(imageURL).min(1).max(12),
  configurations: z.array(z.object({ name: text(2,60), area: money, price: money, plan: imageURL })).min(1).max(15)
}).refine(v=>v.maxPrice>=v.price,{message:'Maximum price must be at least the starting price',path:['maxPrice']});
export const designSchema = z.object({ title:text(4,100),category:z.enum(['Full home','Kitchen','Bedroom','Living room','Wardrobe','Furniture & furnishing','Painting & renovation']),style:text(2,80),description:text(20,2000),image:imageURL,startingPrice:money,inclusions:z.array(text(2,150)).min(1).max(20) });
export const messageSchema = z.object({ text: text(1,3000) });
export const leadSchema = z.object({ kind:z.enum(['project','interior']),project:z.string().optional(),design:z.string().optional(),name:text(2,80),phone:z.string().regex(/^\+?[\d\s-]{10,16}$/),city:text(2,80),homeSize:z.enum(['1 BHK','2 BHK','3 BHK','4+ BHK']).default('2 BHK'),service:z.enum(['Full home','Kitchen','Bedroom','Living room','Wardrobe','Furniture & furnishing','Painting & renovation']).default('Full home'),finish:z.enum(['Essential','Premium','Luxe']).default('Essential'),budget:money,note:text(0,2000).default(''),preferredAt:z.iso.datetime().optional() });
export function estimateInterior(homeSize,service,finish='Essential') {
 const base = {
   'Full home':{ '1 BHK':350000,'2 BHK':550000,'3 BHK':800000,'4+ BHK':1100000},
   Kitchen:180000,
   Bedroom:140000,
   'Living room':120000,
   Wardrobe:90000,
   'Furniture & furnishing':{ '1 BHK':120000,'2 BHK':200000,'3 BHK':280000,'4+ BHK':360000},
   'Painting & renovation':{ '1 BHK':45000,'2 BHK':75000,'3 BHK':110000,'4+ BHK':150000}
 };
 return Math.round((typeof base[service] === 'object' ? base[service][homeSize] : (base[service] || 150000)) * ({Essential:1,Premium:1.35,Luxe:1.8}[finish] || 1));
}
