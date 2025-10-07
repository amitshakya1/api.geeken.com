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
  ClassSerializerInterceptor,
  UseInterceptors,
  Put,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { AssignPermissionDto } from "./dto/assign-permission.dto";
// import { UserResponseDto } from './dto/user-response.dto';
import { PaginationWithRoleDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";

@ApiTags("users")
@Controller("website/users")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor, ResponseInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new user",
    description:
      "Create a new user with optional role assignments. Available roles: super_admin, admin, partner, employee, guest, user",
  })
  @ApiResponse({
    status: 201,
    description: "User created successfully with assigned roles",
  })
  @Permissions(
    "create_user",
    "create_admin",
    "create_super_admin",
    "create_partner",
    "create_employee"
  )
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: any
  ) {
    return this.usersService.create(createUserDto, currentUser.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all users with pagination and search" })
  @ApiResponse({ status: 200, description: "Users retrieved successfully" })
  @Permissions(
    "read_user",
    "read_admin",
    "read_super_admin",
    "read_partner",
    "read_employee"
  )
  findAll(@Query() paginationDto: PaginationWithRoleDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted users with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted users retrieved successfully",
  })
  @Permissions(
    "read_user",
    "read_admin",
    "read_super_admin",
    "read_partner",
    "read_employee"
  )
  findDeletedUsers(@Query() paginationDto: PaginationWithRoleDto) {
    return this.usersService.findDeletedUsers(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "User retrieved successfully" })
  @Permissions(
    "read_user",
    "read_admin",
    "read_super_admin",
    "read_partner",
    "read_employee"
  )
  findOne(@Param("id") id: string) {
    return this.usersService.findItem(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user by ID" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @Permissions(
    "update_user",
    "update_admin",
    "update_super_admin",
    "update_partner",
    "update_employee"
  )
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user by ID" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @Permissions(
    "delete_user",
    "delete_admin",
    "delete_super_admin",
    "delete_partner",
    "delete_employee"
  )
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore soft-deleted user by ID" })
  @ApiResponse({ status: 200, description: "User restored successfully" })
  @Permissions(
    "update_user",
    "update_admin",
    "update_super_admin",
    "update_partner",
    "update_employee"
  )
  async restore(@Param("id") id: string) {
    await this.usersService.restore(id);
    return { message: "User restored successfully" };
  }

  @Post(":id/roles")
  @ApiOperation({ summary: "Assign role to user" })
  @ApiResponse({ status: 200, description: "Role assigned successfully" })
  @Permissions("assign_role")
  assignRole(@Param("id") id: string, @Body() assignRoleDto: AssignRoleDto) {
    return this.usersService.assignRole(id, assignRoleDto.roleName);
  }

  @Post(":id/permissions")
  @ApiOperation({ summary: "Assign permission to user" })
  @ApiResponse({ status: 200, description: "Permission assigned successfully" })
  @Permissions("assign_permission")
  assignPermission(
    @Param("id") id: string,
    @Body() assignPermissionDto: AssignPermissionDto
  ) {
    return this.usersService.assignPermission(
      id,
      assignPermissionDto.permissionName
    );
  }

  @Delete(":id/roles/:roleId")
  @ApiOperation({ summary: "Remove role from user" })
  @ApiResponse({ status: 200, description: "Role removed successfully" })
  @Permissions("remove_role")
  removeRole(@Param("id") id: string, @Param("roleId") roleId: string) {
    return this.usersService.removeRole(id, roleId);
  }

  @Delete(":id/permissions/:permissionId")
  @ApiOperation({ summary: "Remove permission from user" })
  @ApiResponse({ status: 200, description: "Permission removed successfully" })
  @Permissions("remove_permission")
  removePermission(
    @Param("id") id: string,
    @Param("permissionId") permissionId: string
  ) {
    return this.usersService.removePermission(id, permissionId);
  }

  @Get(":id/creation-audit")
  @ApiOperation({ summary: "Get user creation audit history" })
  @ApiResponse({
    status: 200,
    description: "User creation audit retrieved successfully",
  })
  @Permissions(
    "read_user",
    "read_admin",
    "read_super_admin",
    "read_partner",
    "read_employee"
  )
  getUserCreationAudit(@Param("id") id: string) {
    return this.usersService.getUserCreationAudit(id);
  }

  @Get("admin/:adminId/creation-history")
  @ApiOperation({ summary: "Get admin creation history" })
  @ApiResponse({
    status: 200,
    description: "Admin creation history retrieved successfully",
  })
  @Permissions("read_user", "read_admin", "read_super_admin")
  getAdminCreationHistory(@Param("adminId") adminId: string) {
    return this.usersService.getAdminCreationHistory(adminId);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status of users by IDs" })
  @ApiResponse({ status: 200, description: "Users updated successfully" })
  @Permissions(
    "update_user",
    "update_admin",
    "update_super_admin",
    "update_partner",
    "update_employee"
  )
  async updateStatusByIds(@Body() body: UpdateUserStatusDto) {
    const { ids, status } = body;
    return this.usersService.updateStatusByIds(ids, status);
  }
}
