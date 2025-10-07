import { ProductVariant } from "../../common/entities/product-variant.entity";
import { toFileResource } from "../../admin/files/file.resource";

export class ProductVariantResource {
  static toArray(variants: ProductVariant[]) {
    return variants.map((variant) => this.toObject(variant));
  }

  static toObject(variant: ProductVariant) {
    return {
      id: variant.id,
      productId: variant.productId,
      name: variant.name,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      currency: variant.currency,
      capacity: variant.capacity,
      totalRooms: variant.totalRooms,
      dimensions: variant.dimensions,
      extraBed: variant.extraBed,
      foodOptions: variant.foodOptions,
      amenities: variant.amenities
        ? variant.amenities.map((amenity) => ({
          id: amenity.id,
          name: amenity.name,
        }))
        : [],
      files: variant.files
        ? variant.files.map((file) => toFileResource(file))
        : [],
      status: variant.status,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }
}
