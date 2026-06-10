export const SITE_NAME = 'Shopsastamart';
export const SITE_DESCRIPTION = 'Premium fashion jewelry with Cash on Delivery, free shipping & luxury gift box. Handcrafted necklaces, pendants, and gift sets trusted by 1,000+ customers across India.';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://shopsastamart.com';
export const CONTACT = { email: 'support@shopsastamart.com', phone: '+91-8678037094', whatsapp: '918678037094' };

export function generateProductTitle(name) {
  return `${name} | ${SITE_NAME}`;
}

export function generateProductDescription(name, category, shortDescription) {
  const desc = shortDescription || `Premium ${category?.toLowerCase() || 'fashion jewelry'} - ${name}.`;
  return `${desc} Cash on Delivery available. Free shipping across India. Premium gift box included.`;
}
