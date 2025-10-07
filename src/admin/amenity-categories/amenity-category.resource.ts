import { AmenityCategory } from "../../common/entities/amenity-category.entity";

export function toAmenityCategoryResource(amenityCategory: AmenityCategory): any {
  return {
    id: amenityCategory.id,
    name: amenityCategory.name,
    // user: amenityCategory.user ? { id: amenityCategory.user.id, email: amenityCategory.user.email } : null,
    // products: amenityCategory.products ? amenityCategory.products.map(p => ({ id: p.id, name: p.name })) : [],
    status: amenityCategory.status,
    createdAt: amenityCategory.createdAt,
    updatedAt: amenityCategory.updatedAt,
    deletedAt: amenityCategory.deletedAt,
  };
}
