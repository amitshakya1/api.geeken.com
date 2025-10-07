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
import { TypesService } from "./types.service";
import { CreateTypeDto } from "./dto/create-type.dto";
import { UpdateTypeDto } from "./dto/update-type.dto";
import { UpdateTypeStatusDto } from "./dto/update-type-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("types")
@Controller("admin/types")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new type" })
  @ApiResponse({ status: 201, description: "Type created successfully" })
  @Permissions("create_type")
  create(@Body() createTypeDto: CreateTypeDto, @CurrentUser() user) {
    return this.typesService.create(createTypeDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all types with pagination and search" })
  @ApiResponse({ status: 200, description: "Types retrieved successfully" })
  @Permissions("read_type")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.typesService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted types with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted types retrieved successfully",
  })
  @Permissions("read_type")
  findDeletedTypes(@Query() paginationDto: PaginationDto) {
    return this.typesService.findDeletedTypes(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get type by ID" })
  @ApiResponse({ status: 200, description: "Type retrieved successfully" })
  @Permissions("read_type")
  findOne(@Param("id") id: string) {
    return this.typesService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update type by ID" })
  @ApiResponse({ status: 200, description: "Type updated successfully" })
  @Permissions("update_type")
  update(@Param("id") id: string, @Body() updateTypeDto: UpdateTypeDto) {
    return this.typesService.update(id, updateTypeDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete type by ID" })
  @ApiResponse({ status: 200, description: "Type deleted successfully" })
  @Permissions("delete_type")
  remove(@Param("id") id: string) {
    return this.typesService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted type by ID" })
  @ApiResponse({ status: 200, description: "Type restored successfully" })
  @Permissions("update_type")
  restore(@Param("id") id: string) {
    return this.typesService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status type by IDs" })
  @ApiResponse({ status: 200, description: "Types updated successfully" })
  @Permissions("update_type")
  async updateStatusByIds(@Body() body: UpdateTypeStatusDto) {
    const { ids, status } = body;
    return this.typesService.updateStatusByIds(ids, status);
  }
}
