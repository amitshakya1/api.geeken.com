import { Page } from "../../common/entities/page.entity";
import { toFileResource } from "../../admin/files/file.resource";

export function toPageResource(page: Page): any {
  return {
    id: page.id,
    name: page.name,
    slug: page.slug,
    tagLine: page.tagLine,
    description: page.description,
    seoTitle: page.seoTitle,
    seoKeywords: page.seoKeywords,
    seoDescription: page.seoDescription,
    status: page.status,
    files: page.files ? page.files.map((file) => toFileResource(file)) : [],
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    deletedAt: page.deletedAt,
  };
}
