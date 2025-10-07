import { Collection } from "../../common/entities/collection.entity";
import { toFileResource } from "../files/file.resource";

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
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    deletedAt: collection.deletedAt,
  };
}
