const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://shopsastamart.com';

export function productSchema(product) {
  const images = product.images?.map((i) => i.imageUrl) || [];
  const primaryImage = product.image || images[0] || '';
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    sku: product.sku || undefined,
    category: product.category || undefined,
    image: images.length ? images : primaryImage || undefined,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stockQuantity && product.stockQuantity > 0
        ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    brand: { '@type': 'Brand', name: 'Shopsastamart' },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shopsastamart',
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    contactPoint: [{
      '@type': 'ContactPoint',
      telephone: '+91-8678037094',
      contactType: 'customer service',
      email: 'support@shopsastamart.com',
    }],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Shopsastamart',
    url: SITE_URL,
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
    })),
  };
}

export function faqSchema(questions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };
}
