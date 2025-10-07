import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Permission } from "../../common/entities/permission.entity";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { PermissionsGateway } from "./permissions.gateway";
import { UsersService } from "../users/users.service";
import { toPermissionResource } from "./permission.resource";
import { EntityStatus } from "../../common/enums/status.enum";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    private permissionsGateway: PermissionsGateway,
    private usersService: UsersService // Make sure UsersService is provided in PermissionsModule
  ) { }

  async create(
    createPermissionDto: CreatePermissionDto,
    userId: string
  ): Promise<Permission> {
    const existingPermission = await this.permissionsRepository.findOne({
      where: { name: createPermissionDto.name },
    });

    if (existingPermission) {
      throw new ConflictException("Permission with this name already exists");
    }

    const permission = this.permissionsRepository.create({
      ...createPermissionDto,
      user: { id: userId },
    });
    const saved = await this.permissionsRepository.save(permission);
    await this.notifySuperAdmins();
    return this.findOne(saved.id);
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findPermissionsWithFilters(paginationDto, false);
  }

  async findDeletedPermissions(paginationDto: PaginationDto): Promise<any> {
    return this.findPermissionsWithFilters(paginationDto, true);
  }

  private async findPermissionsWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.permissionsRepository.createQueryBuilder("permission");

    if (includeDeleted) {
      queryBuilder.withDeleted().where("permission.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "permission.name ILIKE :search OR permission.description ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    if (status) {
      queryBuilder.andWhere("permission.status = :status", { status });
    }

    const [permissions, total] = await queryBuilder
      .orderBy(
        includeDeleted ? "permission.deletedAt" : "permission.createdAt",
        "DESC"
      )
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted permissions retrieved successfully"
        : "Permissions retrieved successfully",
      items: permissions.map(toPermissionResource),
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

  async findAllGrouped(): Promise<any> {
    const permissions = await this.permissionsRepository.find({
      order: { group: "ASC", name: "ASC" },
    });

    // Group permissions by their group
    const groupedPermissions = permissions.reduce(
      (acc, permission) => {
        const group = permission.group || "Other";
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(toPermissionResource(permission));
        return acc;
      },
      {} as Record<string, any[]>
    );

    // Transform to the format expected by the UI
    const items = Object.entries(groupedPermissions).map(
      ([groupName, perms]) => ({
        name: groupName,
        permissions: perms,
        total: perms.length,
        selected: 0, // This will be calculated on the frontend based on selected permissions
      })
    );


    return {
      status: "success",
      message: "Permissions retrieved successfully",
      items: items,
      meta: {
        page: 1,
        limit: 500,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const permission = await this.permissionsRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException("Permission not found");
    }
    return toPermissionResource(permission);
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto
  ): Promise<Permission> {
    const permission = await this.findOne(id);

    if (
      updatePermissionDto.name &&
      updatePermissionDto.name !== permission.name
    ) {
      const existingPermission = await this.permissionsRepository.findOne({
        where: { name: updatePermissionDto.name },
      });

      if (existingPermission) {
        throw new ConflictException("Permission with this name already exists");
      }
    }


    if (updatePermissionDto.name) {
      delete updatePermissionDto.name;
      delete updatePermissionDto.group;
    }

    Object.assign(permission, updatePermissionDto);
    const saved = await this.permissionsRepository.save(permission);
    await this.notifySuperAdmins();
    return this.findOne(saved.id);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionsRepository.softRemove(permission);
    await this.notifySuperAdmins();
  }

  async restore(id: string): Promise<void> {
    await this.permissionsRepository.restore(id);
  }

  async updateStatusByIds(ids: string[], status: string): Promise<any> {
    if (!ids || ids.length === 0) {
      return {
        status: "success",
        message: "No IDs provided; nothing to update",
        items: [],
      };
    }
    console.log("status", status);
    switch (status) {
      case "restore":
        await this.permissionsRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.permissionsRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.permissionsRepository.update({ id: In(ids) }, { status: status as EntityStatus });
        break;
    }

    const updated = await this.permissionsRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    });

    return {
      status: "success",
      message: "Permissions updated successfully",
      items: updated.map(toPermissionResource),
    };
  }

  private async notifySuperAdmins() {
    // Get all super_admin user IDs
    const superAdmins = await this.usersService.findAll({
      page: 1,
      limit: 1000,
    });
    const userIds = (superAdmins.data || [])
      .filter(
        (u) =>
          u.userRoles &&
          u.userRoles.some((ur) => ur.role && ur.role.name === "super_admin")
      )
      .map((u) => u.id);
    this.permissionsGateway.notifyPermissionsChanged(userIds);
  }
}
