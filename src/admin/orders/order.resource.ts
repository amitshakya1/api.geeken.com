import { toProductResource } from "../products/product.resource";
import { OrderProduct } from "../../common/entities/order-products.entity";
import { Order } from "../../common/entities/order.entity";

function toOrderProductResource(orderProduct: OrderProduct): any {
  return {
    id: orderProduct.id,

    // Snapshot data (immutable)
    productSnapshot: orderProduct.productSnapshot ?? null,
    productVariantSnapshot: orderProduct.productVariantSnapshot ?? null,

    // Names (for quick access)
    productName:
      orderProduct.productSnapshot?.name ?? orderProduct.product?.name,
    variantName:
      orderProduct.productVariantSnapshot?.name ??
      orderProduct.productVariant?.name,

    // Pricing / stay details
    pricePerNight: orderProduct.pricePerNight,
    currency: orderProduct.currency,
    nights: orderProduct.nights,
    numberOfRooms: orderProduct.numberOfRooms,
    capacity: orderProduct.capacity,

    // Costs
    subtotal: Number(orderProduct.subtotal),
    taxAmount: Number(orderProduct.taxAmount ?? 0),
    discountAmount: Number(orderProduct.discountAmount ?? 0),
    total: Number(orderProduct.total),

    // Extras
    extraBed: orderProduct.extraBed,
    foodOptions: orderProduct.foodOptions,
    cancellationPolicy: orderProduct.cancellationPolicy,
    specialRequests: orderProduct.specialRequests,

    // Discounts / Taxes
    discountDetails: orderProduct.discountDetails ?? null,
    taxes: orderProduct.taxes ?? [],

    // Commission
    commissionPercentage: orderProduct.commissionPercentage ?? null,
    commissionAmount: orderProduct.commissionAmount ?? null,

    // Live product relation (optional)
    product: orderProduct.product
      ? toProductResource(orderProduct.product)
      : null,

    createdAt: orderProduct.createdAt,
    updatedAt: orderProduct.updatedAt,
  };
}

export function toOrderResource(order: Order): any {
  return {
    id: order.id,
    invoiceNo: order.invoiceNo,
    checkInDate: order.checkInDate,
    checkOutDate: order.checkOutDate,

    // Guests
    guests: order.guests,

    // Pricing
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount ?? 0),
    discountAmount: Number(order.discountAmount ?? 0),
    total: Number(order.total),

    // Discounts / Taxes (aggregated from products)
    discountDetails: order.discountDetails ?? [],
    taxes: order.taxes ?? [],

    // Commission details
    commissionRates: order.commissionRates ?? [],
    commissionPercentage: order.commissionPercentage ?? null,
    commissionAmount: order.commissionAmount ?? null,

    // Payments
    payment: order.payment ?? null,

    // Relations
    guest: order.guest
      ? {
        id: order.guest.id,
        firstName: order.guest.firstName,
        lastName: order.guest.lastName,
        email: order.guest.email,
        phone: order.guest.phone,
      }
      : null,

    user: order.user
      ? {
        id: order.user.id,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
      }
      : null,

    orderProducts: order.orderProducts
      ? order.orderProducts.map(toOrderProductResource)
      : [],

    // Meta fields
    additionalDetails: order.additionalDetails,
    riskDetails: order.riskDetails,
    conversionSummary: order.conversionSummary,
    communicationChannels: order.communicationChannels,
    tags: order.tags,
    notes: order.notes,
    status: order.status,

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
