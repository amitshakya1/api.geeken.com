import { BlogCategory } from "../../common/entities/blog-category.entity";

export function toBlogCategoryResource(blogCategory: BlogCategory): any {
  return {
    id: blogCategory.id,
    name: blogCategory.name,
    // user: blogCategory.user ? { id: blogCategory.user.id, email: blogCategory.user.email } : null,
    // posts: blogCategory.posts ? blogCategory.posts.map(p => ({ id: p.id, title: p.title })) : [],
    status: blogCategory.status,
    createdAt: blogCategory.createdAt,
    updatedAt: blogCategory.updatedAt,
    deletedAt: blogCategory.deletedAt,
  };
}
