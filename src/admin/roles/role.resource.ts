import { toPermissionResource } from "../permissions/permission.resource";
import { Role } from "../../common/entities/role.entity";

export function toRoleResource(role: Role): any {
  function formatRoleName(roleName: string): string {
    const str = roleName.replace(/_/g, " "); // replace underscores with spaces
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(); // Capitalize only first letter
  }

  return {
    id: role.id,
    name: role.name,
    displayName: formatRoleName(role.name),
    description: role.description,
    status: role.status,
    permissions:
      role.rolePermissions
        ?.map((rp) => toPermissionResource(rp.permission))
        .filter(Boolean) || [],
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    deletedAt: role.deletedAt,
  };
}
