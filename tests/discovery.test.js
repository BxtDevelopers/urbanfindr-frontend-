import test from 'node:test';
import assert from 'node:assert/strict';
import { categories, categoryFor, cityFor, listingQuery, isMonthly, summarizeDiscovery } from '../lib/catalog.js';
import { propertySchema } from '../lib/validation.js';
const home={title:'A bright and spacious home',description:'A comfortable property with natural light and everyday amenities nearby.',purpose:'rent',type:'Apartment',city:'Pune',locality:'Baner',address:'12 Green Lane',price:30000,area:1200,bedrooms:2,bathrooms:2,furnishing:'Semi-furnished',availableFrom:'2027-01-01',amenities:[],images:['/images/home-1.svg']};

test('dedicated page constraints survive conflicting URL parameters',()=>{
 const query=listingQuery(new URLSearchParams('purpose=rent&city=Mumbai&maxPrice=9000000&page=3'),{purpose:'buy',city:'Pune'});
 assert.equal(query.get('purpose'),'buy');assert.equal(query.get('city'),'Pune');assert.equal(query.get('maxPrice'),'9000000');assert.equal(query.get('page'),'3');
});
test('city summaries preserve zero inventory and aggregate category totals',()=>{
 const result=summarizeDiscovery([{_id:{city:'Pune',purpose:'buy'},count:3},{_id:{city:'Pune',purpose:'pg'},count:2},{_id:{city:'Mumbai',purpose:'rent'},count:5}],[{_id:'Pune',count:1}],2);
 assert.equal(result.total,10);assert.equal(result.featured,2);assert.equal(result.purposes.pg,2);assert.equal(result.cities.find(c=>c.slug==='pune').total,5);assert.equal(result.cities.find(c=>c.slug==='pune').projects,1);assert.equal(result.cities.find(c=>c.slug==='chennai').total,0);
});
test('commercial sale prices are never labelled as monthly rent',()=>{
 assert.equal(isMonthly({purpose:'buy'}),false);assert.equal(isMonthly({purpose:'commercial',transaction:'sale'}),false);assert.equal(isMonthly({purpose:'commercial',transaction:'lease'}),true);assert.equal(isMonthly({purpose:'pg'}),true);
});
test('PG input validates room types, bed counts and meals',()=>{
 const input={...home,purpose:'pg',type:'PG',sharing:'2 sharing',mealsIncluded:true,availableBeds:3};
 assert.equal(propertySchema.parse(input).availableBeds,3);assert.equal(propertySchema.safeParse({...input,availableBeds:-1}).success,false);assert.equal(propertySchema.safeParse({...input,sharing:'100 sharing'}).success,false);assert.equal(propertySchema.safeParse({...input,type:'Office'}).success,false);
});
test('commercial input requires a business space and valid transaction',()=>{
 assert.equal(propertySchema.safeParse({...home,purpose:'commercial',type:'Office',transaction:'sale'}).success,true);assert.equal(propertySchema.safeParse({...home,purpose:'commercial',type:'Apartment'}).success,false);assert.equal(propertySchema.safeParse({...home,purpose:'commercial',type:'Shop',transaction:'free'}).success,false);
});
test('owners cannot forge featured or moderation fields while posting',()=>{
 const result=propertySchema.parse({...home,featured:true,status:'approved',verified:true});assert.equal(result.featured,undefined);assert.equal(result.status,undefined);assert.equal(result.verified,undefined);
});
test('all category and city routes resolve to the shared canonical configuration',()=>{
 assert.equal(new Set(categories.map(c=>c.path)).size,4);assert.equal(categoryFor('pg').path,'/pg');assert.equal(cityFor('delhi-ncr').name,'Delhi NCR');assert.equal(cityFor('not-a-city'),undefined);
});
