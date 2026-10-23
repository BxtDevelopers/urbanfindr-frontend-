// All demo images are bundled locally; source links are retained in PHOTO-SOURCES.md.
export const photos = {
  hero: '/photos/hero-home.jpg',
  houses: ['/photos/house-1.jpg', '/photos/house-2.jpg', '/photos/hero-home.jpg'],
  living: ['/photos/living-1.jpg', '/photos/living-2.jpg', '/photos/apartment-1.jpg'],
  bedrooms: ['/photos/bedroom-3.jpg', '/photos/bedroom-1.jpg', '/photos/bedroom-2.jpg'],
  kitchens: ['/photos/kitchen-2.jpg', '/photos/kitchen-1.jpg'],
  wardrobes: ['/photos/wardrobe-1.jpg'],
  offices: ['/photos/office-1.jpg', '/photos/office-2.jpg', '/photos/commercial-1.jpg'],
  projects: ['/photos/builder-1.jpg', '/photos/house-2.jpg', '/photos/house-1.jpg'],
};
const legacy = {
  '/images/hero.svg': photos.hero,
  ...Object.fromEntries(Array.from({ length: 6 }, (_, index) => [`/images/home-${index + 1}.svg`, [...photos.houses, ...photos.projects][index]])),
  ...Object.fromEntries([photos.living[0],photos.kitchens[0],photos.bedrooms[0],photos.living[1],photos.wardrobes[0],photos.kitchens[1]].map((image,index)=>[`/images/interior-${index+1}.svg`,image])),
};
export function resolveImage(source) { return legacy[source] || source || photos.hero; }
export function propertyGallery(property, index = 0) {
  const pick = list => list[index % list.length];
  if (property.purpose === 'pg') return [pick(photos.bedrooms),photos.bedrooms[(index+1)%photos.bedrooms.length],pick(photos.living)];
  if (property.purpose === 'commercial') return [pick(photos.offices),photos.offices[(index+1)%photos.offices.length],'/photos/commercial-1.jpg'];
  const cover = property.purpose === 'rent' ? pick(photos.living) : property.type === 'Apartment' ? '/photos/builder-1.jpg' : pick(photos.houses);
  return [cover,pick(photos.living),pick(photos.bedrooms),pick(photos.kitchens)];
}
export function projectGallery(index=0) { return [photos.projects[index%photos.projects.length],photos.living[index%photos.living.length],photos.bedrooms[index%photos.bedrooms.length]]; }
export function designPhoto(category,index=0) { const list=({Kitchen:photos.kitchens,Bedroom:photos.bedrooms,'Living room':photos.living,Wardrobe:photos.wardrobes,'Full home':photos.living})[category]||photos.living;return list[index%list.length]; }

const legacyPropertyImage = source => /^\/images\/(?:home|interior)-\d+\.svg$/.test(source || '');
export function propertyImages(property) {
  const fallback=propertyGallery(property || {});
  return property?.images?.length ? property.images.map((source,index)=>legacyPropertyImage(source)?fallback[index%fallback.length]:source) : fallback;
}
export function projectImages(project) {
  const fallback=projectGallery();
  return project?.images?.length ? project.images.map((source,index)=>legacyPropertyImage(source)?fallback[index%fallback.length]:source) : fallback;
}
export function designImage(design) { return /^\/images\/interior-\d+\.svg$/.test(design?.image||'')?designPhoto(design.category):design?.image||photos.living[0]; }
