const prisma = require('./prisma');

async function generateOrderNumber() {
  const year = new Date().getFullYear();
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
  } catch (error) {
    console.error('Error generating order number:', error);
    return `ORD-${year}-${String(Date.now()).slice(-6)}`;
  }
}

module.exports = { generateOrderNumber };
