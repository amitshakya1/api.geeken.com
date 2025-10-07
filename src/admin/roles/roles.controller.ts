import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  Put,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AssignPermissionDto } from "./dto/assign-permission.dto";
import { UpdateRoleStatusDto } from "./dto/update-role-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("roles")
@Controller("admin/roles")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new role",
    description:
      "Create a new role with optional permissions. You can provide an array of permission names to assign multiple permissions at once.",
  })
  @ApiResponse({ status: 201, description: "Role created successfully" })
  @Permissions("create_role")
  create(@Body() createRoleDto: CreateRoleDto, @CurrentUser() user) {
    return this.rolesService.create(createRoleDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all roles with pagination" })
  @ApiResponse({ status: 200, description: "Roles retrieved successfully" })
  @Permissions("read_role")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.rolesService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({ summary: "Get all soft-deleted roles with pagination" })
  @ApiResponse({
    status: 200,
    description: "Deleted roles retrieved successfully",
  })
  @Permissions("read_role")
  findDeletedRoles(@Query() paginationDto: PaginationDto) {
    return this.rolesService.findDeletedRoles(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get role by ID" })
  @ApiResponse({ status: 200, description: "Role retrieved successfully" })
  @Permissions("read_role")
  findOne(@Param("id") id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({
    summary: "Update role by ID",
    description:
      "Update role information and optionally replace all permissions. If permissions are provided, all existing permissions will be removed and replaced with the new ones.",
  })
  @ApiResponse({ status: 200, description: "Role updated successfully" })
  @Permissions("update_role")
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete role by ID" })
  @ApiResponse({ status: 200, description: "Role deleted successfully" })
  @Permissions("delete_role")
  remove(@Param("id") id: string) {
    return this.rolesService.remove(id);
  }

  @Post(":id/permissions")
  @ApiOperation({ summary: "Assign permission to role" })
  @ApiResponse({ status: 200, description: "Permission assigned successfully" })
  @Permissions("assign_permission")
  assignPermission(
    @Param("id") id: string,
    @Body() assignPermissionDto: AssignPermissionDto
  ) {
    return this.rolesService.assignPermission(
      id,
      assignPermissionDto.permissionName
    );
  }

  @Delete(":id/permissions/:permissionId")
  @ApiOperation({ summary: "Remove permission from role" })
  @ApiResponse({ status: 200, description: "Permission removed successfully" })
  @Permissions("remove_permission")
  removePermission(
    @Param("id") id: string,
    @Param("permissionId") permissionId: string
  ) {
    return this.rolesService.removePermission(id, permissionId);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore soft-deleted role by ID" })
  @ApiResponse({ status: 200, description: "Role restored successfully" })
  @Permissions("update_role")
  async restore(@Param("id") id: string) {
    await this.rolesService.restore(id);
    return { message: "Role restored successfully" };
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status role by IDs" })
  @ApiResponse({ status: 200, description: "Roles updated successfully" })
  @Permissions("update_role")
  async updateStatusByIds(@Body() body: UpdateRoleStatusDto) {
    const { ids, status } = body;
    return this.rolesService.updateStatusByIds(ids, status);
  }
}
