import { Collection } from "../../common/entities/collection.entity";
import { toFileResource } from "../../admin/files/file.resource";
import { toProductResource } from "../products/product.resource";

export function toCollectionResource(collection: Collection): any {
  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    tagLine: collection.tagLine,
    description: collection.description,
    seoTitle: collection.seoTitle,
    seoKeywords: collection.seoKeywords,
    seoDescription: collection.seoDescription,
    status: collection.status,
    files: collection.files
      ? collection.files.map((file) => toFileResource(file))
      : [],
    products: collection.products
      ? collection.products.map((product) => toProductResource(product))
      : [],
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    deletedAt: collection.deletedAt,
  };
}
