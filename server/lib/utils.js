const { PrismaClient } = require('@prisma/client');

async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const prisma = new PrismaClient();
  try {
    const lastOrder = await prisma.order.findFirst({
      where: { orderNumber: { startsWith: `ORD-${year}-` } },
      orderBy: { orderNumber: 'desc' },
    });
    let nextSeq = 1;
    if (lastOrder) {
      const parts = lastOrder.orderNumber.split('-');
      nextSeq = parseInt(parts[2], 10) + 1;
    }
    return `ORD-${year}-${String(nextSeq).padStart(6, '0')}`;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { generateOrderNumber };
