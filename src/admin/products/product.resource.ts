import { Product } from "../../common/entities/product.entity";
import { toFileResource } from "../files/file.resource";
import { ProductVariantResource } from "./product-variant.resource";

export function toProductResource(product: Product): any {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    tagLine: product.tagLine,
    badge: product.badge,
    description: product.description,
    tags: product.tags,
    address: product.address,
    contact: product.contact,
    bookingContact: product.bookingContact,
    policies: product.policies,
    latitude: product.latitude,
    longitude: product.longitude,
    website: product.website,
    embedMapUrl: product.embedMapUrl,
    rating: product.rating,
    type: product.type
      ? {
        id: product.type.id,
        name: product.type.name,
      }
      : null,
    collections: product.collections
      ? product.collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
      }))
      : [],
    amenities: product.amenities
      ? product.amenities.map((amenity) => ({
        id: amenity.id,
        name: amenity.name,
      }))
      : [],
    files: product.files
      ? product.files.map((file) => toFileResource(file))
      : [],
    variants: product.variants
      ? ProductVariantResource.toArray(product.variants)
      : [],

    partner: product.partner
      ? {
        id: product.partner.id,
        firstName: product.partner.firstName,
        lastName: product.partner.lastName,
      }
      : null,
    user: product.user
      ? {
        id: product.user.id,
        firstName: product.user.firstName,
        lastName: product.user.lastName,
      }
      : null,
    seoTitle: product.seoTitle,
    seoKeywords: product.seoKeywords,
    seoDescription: product.seoDescription,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    deletedAt: product.deletedAt,
  };
}
