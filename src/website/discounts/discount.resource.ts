import { Discount } from "../../common/entities/discount.entity";

export const toDiscountResource = (discount: Discount) => {
  return {
    id: discount.id,
    name: discount.name,
    description: discount.description,
    type: discount.type,
    value: discount.value,
    eligibleProductIds: discount.eligibleProductIds,
    freeProductIds: discount.freeProductIds,
    buyQuantity: discount.buyQuantity,
    getQuantity: discount.getQuantity,
    minimumOrderValue: discount.minimumOrderValue,
    maximumDiscountValue: discount.maximumDiscountValue,
    applicableOn: discount.applicableOn,
    startDate: discount.startDate,
    endDate: discount.endDate,
    usageLimit: discount.usageLimit,
    usedCount: discount.usedCount,
    status: discount.status,
    promoCode: discount.promoCode,
    isPublic: discount.isPublic,
    isMaximumDiscountValue: discount.isMaximumDiscountValue,
    isAutoApply: discount.isAutoApply,
    isUsageLimitPerUser: discount.isUsageLimitPerUser,
    usageLimitPerUser: discount.usageLimitPerUser,
    isFreeShipping: discount.isFreeShipping,
    maxApplicationsPerOrder: discount.maxApplicationsPerOrder,
    products:
      discount.products?.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
      })) || [],
    collections:
      discount.collections?.map((collection) => ({
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
      })) || [],
    createdAt: discount.createdAt,
    updatedAt: discount.updatedAt,
  };
};
