import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Role } from "../../common/entities/role.entity";
import { RolePermission } from "../../common/entities/role-permission.entity";
import { Permission } from "../../common/entities/permission.entity";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toRoleResource } from "./role.resource";
import { EntityStatus } from "../../common/enums/status.enum";

@Injectable()
export class RolesService {
  permissionService: any;

  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionsRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>
  ) { }

  async create(createRoleDto: CreateRoleDto, userId: string): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException("Role with this name already exists");
    }

    const role = this.rolesRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
      user: { id: userId },
    });

    const savedRole = await this.rolesRepository.save(role);

    // Handle permissions if provided
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      await this.assignMultiplePermissions(
        savedRole.id,
        createRoleDto.permissions
      );
    }

    return this.findOne(savedRole.id);
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findRolesWithFilters(paginationDto, false);
  }

  async findDeletedRoles(paginationDto: PaginationDto): Promise<any> {
    return this.findRolesWithFilters(paginationDto, true);
  }

  private async findRolesWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.rolesRepository
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.rolePermissions", "rolePermissions")
      .leftJoinAndSelect("rolePermissions.permission", "permission");

    if (includeDeleted) {
      queryBuilder.withDeleted().where("role.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "role.name ILIKE :search OR role.description ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    if (status) {
      queryBuilder.andWhere("role.status = :status", { status });
    }

    const [roles, total] = await queryBuilder
      .orderBy(includeDeleted ? "role.deletedAt" : "role.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted roles retrieved successfully"
        : "Roles retrieved successfully",
      items: roles.map(toRoleResource),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOneByName(name: string): Promise<any> {
    const role = await this.rolesRepository.findOne({
      where: { name },
      relations: ["rolePermissions", "rolePermissions.permission"],
    });
    if (!role) {
      throw new NotFoundException("Role not found");
    }
    const permissions =
      role.rolePermissions?.map((rp) => rp.permission?.name).filter(Boolean) ||
      [];
    return toRoleResource(role);
  }

  async findOne(id: string): Promise<any> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ["rolePermissions", "rolePermissions.permission"],
    });
    if (!role) {
      throw new NotFoundException("Role not found");
    }
    return toRoleResource(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.rolesRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException("Role with this name already exists");
      }
    }

    // Update role basic info
    const { permissions, ...roleData } = updateRoleDto;
    Object.assign(role, roleData);

    if (updateRoleDto.name) {
      delete updateRoleDto.name;
    }

    const savedRole = await this.rolesRepository.save(role);

    // Handle permissions if provided
    if (permissions !== undefined) {
      // Remove all existing permissions
      await this.rolePermissionsRepository.delete({ role: { id } });

      // Assign new permissions if any
      if (permissions && permissions.length > 0) {
        await this.assignMultiplePermissions(id, permissions);
      }
    }

    return this.findOne(savedRole.id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.softRemove(role);
  }

  async restore(id: string): Promise<void> {
    await this.rolesRepository.restore(id);
  }

  async assignPermission(
    roleId: string,
    permissionName: string
  ): Promise<void> {
    const role = await this.findOne(roleId);
    const permission = await this.permissionsRepository.findOne({
      where: { name: permissionName },
    });

    if (!permission) {
      throw new NotFoundException("Permission not found");
    }

    const existingRolePermission = await this.rolePermissionsRepository.findOne(
      {
        where: { role: { id: roleId }, permission: { id: permission.id } },
      }
    );

    if (existingRolePermission) {
      throw new ConflictException("Role already has this permission");
    }

    const rolePermission = this.rolePermissionsRepository.create({
      role,
      permission,
    });

    await this.rolePermissionsRepository.save(rolePermission);
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    const rolePermission = await this.rolePermissionsRepository.findOne({
      where: { role: { id: roleId }, permission: { id: permissionId } },
    });

    if (!rolePermission) {
      throw new NotFoundException("Role permission not found");
    }

    await this.rolePermissionsRepository.remove(rolePermission);
  }

  async assignMultiplePermissions(
    roleId: string,
    permissionNames: string[]
  ): Promise<void> {
    const role = await this.findOne(roleId);

    // Get all permissions by names
    const permissions = await this.permissionsRepository.find({
      where: permissionNames.map((name) => ({ name })),
    });

    console.log(permissions.length !== permissionNames.length);

    if (permissions.length !== permissionNames.length) {
      const foundPermissionNames = permissions.map((p) => p.name);
      const missingPermissions = permissionNames.filter(
        (name) => !foundPermissionNames.includes(name)
      );
      throw new NotFoundException(
        `Permissions not found: ${missingPermissions.join(", ")}`
      );
    }

    // Check for existing role permissions to avoid duplicates
    const existingRolePermissions = await this.rolePermissionsRepository.find({
      where: { role: { id: roleId } },
      relations: ["permission"],
    });

    const existingPermissionIds = existingRolePermissions.map(
      (rp) => rp.permission.id
    );
    const newPermissions = permissions.filter(
      (permission) => !existingPermissionIds.includes(permission.id)
    );
    // Create new role permissions
    const rolePermissions = newPermissions.map((permission) =>
      this.rolePermissionsRepository.create({
        role,
        permission,
      })
    );
    if (rolePermissions.length > 0) {
      await this.rolePermissionsRepository.save(rolePermissions);
    }
  }

  async updateStatusByIds(ids: string[], status: string): Promise<any> {
    if (!ids || ids.length === 0) {
      return {
        status: "success",
        message: "No IDs provided; nothing to update",
        items: [],
      };
    }

    switch (status) {
      case "restore":
        await this.rolesRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.rolesRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.rolesRepository.update({ id: In(ids) }, { status: status as EntityStatus });
        break;
    }

    const updated = await this.rolesRepository.find({
      where: { id: In(ids) },
      relations: ["rolePermissions", "rolePermissions.permission"],
      withDeleted: true,
    });

    return {
      status: "success",
      message: "Roles updated successfully",
      items: updated.map(toRoleResource),
    };
  }
}
