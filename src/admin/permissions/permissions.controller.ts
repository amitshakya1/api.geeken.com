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
import { PermissionsService } from "./permissions.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { UpdatePermissionStatusDto } from "./dto/update-permission-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("permissions")
@Controller("admin/permissions")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new permission" })
  @ApiResponse({ status: 201, description: "Permission created successfully" })
  @Permissions("create_permission")
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @CurrentUser() user
  ) {
    return this.permissionsService.create(createPermissionDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all permissions with pagination" })
  @ApiResponse({
    status: 200,
    description: "Permissions retrieved successfully",
  })
  @Permissions("read_permission")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.permissionsService.findAll(paginationDto);
  }

  @Get("grouped")
  @ApiOperation({ summary: "Get all permissions grouped by category" })
  @ApiResponse({
    status: 200,
    description: "Permissions retrieved successfully",
  })
  @Permissions("read_permission")
  findAllGrouped() {
    return this.permissionsService.findAllGrouped();
  }

  @Get("deleted")
  @ApiOperation({ summary: "Get all soft-deleted permissions with pagination" })
  @ApiResponse({
    status: 200,
    description: "Deleted permissions retrieved successfully",
  })
  @Permissions("read_permission")
  findDeletedPermissions(@Query() paginationDto: PaginationDto) {
    return this.permissionsService.findDeletedPermissions(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get permission by ID" })
  @ApiResponse({
    status: 200,
    description: "Permission retrieved successfully",
  })
  @Permissions("read_permission")
  findOne(@Param("id") id: string) {
    return this.permissionsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update permission by ID" })
  @ApiResponse({ status: 200, description: "Permission updated successfully" })
  @Permissions("update_permission")
  update(
    @Param("id") id: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete permission by ID" })
  @ApiResponse({ status: 200, description: "Permission deleted successfully" })
  @Permissions("delete_permission")
  remove(@Param("id") id: string) {
    return this.permissionsService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore soft-deleted permission by ID" })
  @ApiResponse({ status: 200, description: "Permission restored successfully" })
  @Permissions("update_permission")
  async restore(@Param("id") id: string) {
    await this.permissionsService.restore(id);
    return { message: "Permission restored successfully" };
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status permission by IDs" })
  @ApiResponse({ status: 200, description: "Permissions updated successfully" })
  @Permissions("update_permission")
  async updateStatusByIds(@Body() body: UpdatePermissionStatusDto) {
    const { ids, status } = body;
    return this.permissionsService.updateStatusByIds(ids, status);
  }
}
