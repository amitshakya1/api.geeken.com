import { Type } from "../../common/entities/type.entity";

export function toTypeResource(type: Type): any {
  return {
    id: type.id,
    name: type.name,
    // user: type.user ? { id: type.user.id, email: type.user.email } : null,
    // products: type.products ? type.products.map(p => ({ id: p.id, name: p.name })) : [],
    status: type.status,
    createdAt: type.createdAt,
    updatedAt: type.updatedAt,
    deletedAt: type.deletedAt,
  };
}
