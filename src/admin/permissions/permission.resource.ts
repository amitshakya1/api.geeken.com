import { Permission } from "../../common/entities/permission.entity";

export function toPermissionResource(permission: Permission): any {
  return {
    id: permission.id,
    name: permission.name,
    description: permission.description,
    group: permission.group,
    status: permission.status,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
    deletedAt: permission.deletedAt,
  };
}
