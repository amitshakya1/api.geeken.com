import { Blog } from "../../common/entities/blog.entity";
import { toFileResource } from "../files/file.resource";

export function toBlogResource(blog: Blog): any {
  return {
    id: blog.id,
    name: blog.name,
    slug: blog.slug,
    tagLine: blog.tagLine,
    description: blog.description,
    seoTitle: blog.seoTitle,
    seoKeywords: blog.seoKeywords,
    seoDescription: blog.seoDescription,
    status: blog.status,
    files: blog.files ? blog.files.map((file) => toFileResource(file)) : [],
    categories: blog.categories
      ? blog.categories.map((category) => ({
        id: category.id,
        name: category.name,
      }))
      : [],
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    deletedAt: blog.deletedAt,
  };
}
