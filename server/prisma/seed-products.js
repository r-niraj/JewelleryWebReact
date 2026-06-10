const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const products = [
  {
    name: "Premium Crystal Necklace",
    slug: "premium-crystal-necklace",
    shortDescription: "Designed to turn heads. Made to be remembered. Premium fashion jewelry that looks like a fortune.",
    fullDescription: "Each piece is meticulously hand-finished by skilled artisans who have spent years perfecting their craft. Our proprietary tarnish-resistant coating ensures your necklace stays brilliant and shiny, wear after wear. Inspired by high-end fashion trends, designed to complement both traditional and contemporary outfits. Lightweight construction means you can wear it all day without any discomfort.",
    price: 1299,
    originalPrice: 2499,
    discountPercentage: 48,
    sku: "ELG-CRYSTAL-001",
    stockQuantity: 25,
    category: "Crystal Necklaces",
    isActive: true,
    isFeatured: true,
    images: [
      { file: "necklace-1.jpeg", alt: "Premium Crystal Necklace Front View", primary: false },
      { file: "necklace-2.jpeg", alt: "Necklace Detail Close-up", primary: true },
      { file: "necklace-3.jpeg", alt: "Elegant Necklace on Model", primary: false },
      { file: "necklace-4.jpeg", alt: "Luxury Jewelry Display", primary: false },
      { file: "necklace-5.jpeg", alt: "Crystal Necklace Side View", primary: false },
      { file: "necklace-6.jpeg", alt: "Necklace Elegant Angle", primary: false },
    ],
  },
  {
    name: "Pearl Drop Elegance Necklace",
    slug: "pearl-drop-elegance",
    shortDescription: "Timeless freshwater pearls with a modern drop design for that sophisticated evening look.",
    fullDescription: "Hand-selected freshwater pearls with a luminous lustre, each bead matched for uniform size and colour. The delicate gold-filled chain suspends a cascading pearl drop that catches the light with every movement. A versatile piece that transitions effortlessly from boardroom to ballroom, secured with a reliable lobster clasp.",
    price: 1899,
    originalPrice: 3499,
    discountPercentage: 46,
    sku: "ELG-PEARL-002",
    stockQuantity: 30,
    category: "Pearl Necklaces",
    isActive: true,
    isFeatured: true,
    images: [
      { file: "necklace-7.jpeg", alt: "Pearl Drop Necklace Front View", primary: true },
      { file: "necklace-8.jpeg", alt: "Pearl Necklace Close-up Detail", primary: false },
      { file: "necklace-9.jpeg", alt: "Pearl Necklace on Display", primary: false },
      { file: "necklace-10.jpeg", alt: "Elegant Pearl Jewelry", primary: false },
      { file: "necklace-11.jpeg", alt: "Pearl Drop Side Profile", primary: false },
    ],
  },
  {
    name: "Gold Statement Choker",
    slug: "gold-statement-choker",
    shortDescription: "Bold gold-plated choker with intricate filigree work — for the woman who owns the room.",
    fullDescription: "Inspired by antique Mughal jewellery, this choker features handcrafted filigree patterns meticulously etched into high-quality gold-plated metal. The adjustable chain ensures a perfect fit for any neck size. Its bold presence makes it the ideal centerpiece for both festive occasions and contemporary fusion wear.",
    price: 2499,
    originalPrice: 4999,
    discountPercentage: 50,
    sku: "ELG-GOLD-003",
    stockQuantity: 15,
    category: "Gold Necklaces",
    isActive: true,
    isFeatured: true,
    images: [
      { file: "necklace-12.jpeg", alt: "Gold Choker Front View", primary: true },
      { file: "necklace-13.jpeg", alt: "Gold Filigree Detail", primary: false },
      { file: "necklace-14.jpeg", alt: "Choker on Model", primary: false },
      { file: "necklace-15.jpeg", alt: "Gold Jewelry Display", primary: false },
    ],
  },
  {
    name: "Rose Quartz Heart Pendant",
    slug: "rose-quartz-heart-pendant",
    shortDescription: "Genuine rose quartz set in a rose-gold frame — a subtle whisper of romance.",
    fullDescription: "A genuine rose quartz cabochion, sourced ethically and cut to perfection, set in a hypoallergenic rose-gold plated sterling silver bezel. The soft pink hue of the stone symbolises unconditional love and emotional healing. Comes on a dainty 18-inch cable chain with a secure spring-ring clasp.",
    price: 1599,
    originalPrice: 2999,
    discountPercentage: 47,
    sku: "ELG-ROSE-004",
    stockQuantity: 20,
    category: "Gemstone Pendants",
    isActive: true,
    isFeatured: true,
    images: [
      { file: "necklace-16.jpeg", alt: "Rose Quartz Pendant Front", primary: true },
      { file: "necklace-17.jpeg", alt: "Quartz Stone Detail", primary: false },
      { file: "necklace-18.jpeg", alt: "Pendant on Model", primary: false },
      { file: "necklace-19.jpeg", alt: "Rose Gold Chain Display", primary: false },
      { file: "necklace-20.jpeg", alt: "Heart Pendant Side View", primary: false },
    ],
  },
  {
    name: "Diamond-cut Tennis Necklace",
    slug: "diamond-tennis-necklace",
    shortDescription: "Precision-cut cubic zirconia in a classic tennis setting — maximum sparkle, minimum fuss.",
    fullDescription: "Each CZ stone is precision-cut with 57 facets—the same count as a genuine diamond—for brilliant fire and scintillation. Set in a four-prong rhodium-plated brass setting with a secure box-lock clasp. The classic tennis necklace design never goes out of style and layers beautifully with other chains.",
    price: 3499,
    originalPrice: 6499,
    discountPercentage: 46,
    sku: "ELG-DIAMOND-005",
    stockQuantity: 18,
    category: "Diamond-style Necklaces",
    isActive: true,
    isFeatured: false,
    images: [
      { file: "necklace-21.jpeg", alt: "Tennis Necklace Full View", primary: true },
      { file: "necklace-22.jpeg", alt: "CZ Stone Close-up", primary: false },
      { file: "necklace-23.jpeg", alt: "Necklace on Display Stand", primary: false },
      { file: "necklace-24.jpeg", alt: "Sparkle Detail Shot", primary: false },
    ],
  },
  {
    name: "Vintage Locket with Chain",
    slug: "vintage-locket",
    shortDescription: "Antique-brass locket with floral engraving — a keepsake for your most cherished memories.",
    fullDescription: "Hand-finished antique-brass locket with intricately engraved floral motifs on both faces. Opens to reveal two photo compartments, each protected by a clear acrylic cover. Suspended from a durable 22-inch brass chain with a decorative lobster clasp. Each piece develops a beautiful patina over time, adding to its vintage character.",
    price: 999,
    originalPrice: 1999,
    discountPercentage: 50,
    sku: "ELG-VINTAGE-006",
    stockQuantity: 40,
    category: "Vintage Collection",
    isActive: true,
    isFeatured: false,
    images: [
      { file: "necklace-25.jpeg", alt: "Vintage Locket Front", primary: true },
      { file: "necklace-26.jpeg", alt: "Locket Open View", primary: false },
      { file: "necklace-27.jpeg", alt: "Floral Engraving Detail", primary: false },
      { file: "necklace-28.jpeg", alt: "Locket on Mannequin", primary: false },
      { file: "necklace-29.jpeg", alt: "Brass Chain Display", primary: false },
    ],
  },
];

async function main() {
  // Clear existing products and related data, then re-seed
  await prisma.productImage.deleteMany({});
  await prisma.productVideo.deleteMany({});
  // Also clear productId references on orders
  await prisma.order.updateMany({ where: { productId: { not: null } }, data: { productId: null } });
  await prisma.product.deleteMany({});

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        price: p.price,
        originalPrice: p.originalPrice,
        discountPercentage: p.discountPercentage,
        sku: p.sku,
        stockQuantity: p.stockQuantity,
        category: p.category,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
      },
    });

    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: `/images/${p.images[i].file}`,
          altText: p.images[i].alt,
          displayOrder: i,
          isPrimary: p.images[i].primary,
        },
      });
    }

    console.log(`✓ Seeded "${product.name}" — ₹${product.price} (${p.images.length} images)`);
  }

  console.log(`\nDone! ${products.length} products with ${products.reduce((s, p) => s + p.images.length, 0)} total images.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
