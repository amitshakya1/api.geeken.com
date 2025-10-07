import { Amenity } from "../../common/entities/amenity.entity";

export function toAmenityResource(amenity: Amenity): any {
  return {
    id: amenity.id,
    name: amenity.name,
    description: amenity.description,
    amenityCategory: amenity.amenityCategory ? { id: amenity.amenityCategory.id, name: amenity.amenityCategory.name, status: amenity.amenityCategory.status } : null,
    status: amenity.status,
    createdAt: amenity.createdAt,
    updatedAt: amenity.updatedAt,
    deletedAt: amenity.deletedAt,
  };
}
