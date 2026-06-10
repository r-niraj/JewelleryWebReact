const prisma = require('../../lib/prisma');
const { generateOrderNumber } = require('../../lib/utils');

module.exports = async function handler(req, res) {
  try {
    const body = req.body;
    const { fullName, phone, email, address, city, state, pincode, quantity, notes, productSlug, productId, items } = body;

    if (!fullName?.trim()) return res.status(400).json({ success: false, error: 'Full name is required' });
    if (!phone?.trim() || !/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, error: 'Valid 10-digit phone is required' });
    if (!address?.trim()) return res.status(400).json({ success: false, error: 'Address is required' });
    if (!city?.trim()) return res.status(400).json({ success: false, error: 'City is required' });
    if (!state?.trim()) return res.status(400).json({ success: false, error: 'State is required' });
    if (!pincode?.trim() || !/^\d{6}$/.test(pincode)) return res.status(400).json({ success: false, error: 'Valid 6-digit pincode is required' });

    const orderNumber = await generateOrderNumber();

    const result = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({ where: { phone } });
      if (customer) {
        customer = await tx.customer.update({
          where: { customerId: customer.customerId },
          data: { fullName: fullName.trim(), address: address.trim(), city: city.trim(), state: state?.trim(), pincode: pincode.trim(), email: email?.trim() || null },
        });
      } else {
        customer = await tx.customer.create({
          data: { fullName: fullName.trim(), phone, address: address.trim(), city: city.trim(), state: state?.trim(), pincode: pincode.trim(), email: email?.trim() || null },
        });
      }

      const itemsArray = Array.isArray(items) && items.length > 0 ? items : null;
      let totalAmount = 0;
      let orderProductName = 'Premium Crystal Necklace';
      let orderQty = 1;
      let orderUnitPrice = 1299;

      if (itemsArray) {
        const resolvedItems = await Promise.all(
          itemsArray.map(async (item) => {
            const product = item.slug
              ? await tx.product.findUnique({ where: { slug: item.slug, isActive: true }, include: { images: { take: 1, orderBy: { displayOrder: 'asc' } } } })
              : null;
            const qty = Math.max(1, Math.min(10, parseInt(item.quantity, 10) || 1));
            const unitPrice = product ? Number(product.price) : 0;
            const totalPrice = qty * unitPrice;
            totalAmount += totalPrice;
            return {
              productId: product?.id || null,
              productName: product?.name || item.name || 'Premium Crystal Necklace',
              productImage: product?.images?.[0]?.imageUrl || null,
              quantity: qty,
              unitPrice,
              totalPrice,
            };
          })
        );
        orderProductName = `${resolvedItems.length} items`;
        orderQty = resolvedItems.length;
        orderUnitPrice = totalAmount;

        const order = await tx.order.create({
          data: {
            orderNumber,
            customerId: customer.customerId,
            productName: orderProductName,
            quantity: orderQty,
            unitPrice: orderUnitPrice,
            totalAmount,
            paymentMethod: 'COD',
            status: 'Pending',
            notes: notes?.trim() || null,
          },
        });

        for (const ri of resolvedItems) {
          await tx.orderItem.create({
            data: {
              orderId: order.orderId,
              productId: ri.productId,
              productName: ri.productName,
              productImage: ri.productImage,
              quantity: ri.quantity,
              unitPrice: ri.unitPrice,
              totalPrice: ri.totalPrice,
            },
          });
        }

        return order;
      } else {
        let resolvedProduct = null;
        const qty = Math.max(1, Math.min(10, parseInt(quantity, 10) || 1));

        if (productSlug) {
          resolvedProduct = await tx.product.findUnique({ where: { slug: productSlug, isActive: true } });
        } else if (productId) {
          resolvedProduct = await tx.product.findUnique({ where: { id: Number(productId), isActive: true } });
        }

        const productName = resolvedProduct?.name || 'Premium Crystal Necklace';
        const unitPrice = resolvedProduct ? Number(resolvedProduct.price) : 1299;
        totalAmount = qty * unitPrice;

        const order = await tx.order.create({
          data: {
            orderNumber,
            customerId: customer.customerId,
            productId: resolvedProduct?.id || null,
            productName,
            quantity: qty,
            unitPrice,
            totalAmount,
            paymentMethod: 'COD',
            status: 'Pending',
            notes: notes?.trim() || null,
          },
        });

        return order;
      }
    });

    return res.status(201).json({
      success: true,
      orderNumber: result.orderNumber,
      totalAmount: Number(result.totalAmount),
      message: `Order ${result.orderNumber} placed successfully!`,
    });
  } catch (error) {
    console.error('Order create error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};
