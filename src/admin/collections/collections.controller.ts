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
import { CollectionsService } from "./collections.service";
import { CreateCollectionDto } from "./dto/create-collection.dto";
import { UpdateCollectionDto } from "./dto/update-collection.dto";
import { UpdateCollectionStatusDto } from "./dto/update-collection-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("collections")
@Controller("admin/collections")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new collection" })
  @ApiResponse({ status: 201, description: "Collection created successfully" })
  @Permissions("create_collection")
  create(
    @Body() createCollectionDto: CreateCollectionDto,
    @CurrentUser() user
  ) {
    return this.collectionsService.create(createCollectionDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all collections with pagination and search" })
  @ApiResponse({
    status: 200,
    description: "Collections retrieved successfully",
  })
  @Permissions("read_collection")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.collectionsService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted collections with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted collections retrieved successfully",
  })
  @Permissions("read_collection")
  findDeletedCollections(@Query() paginationDto: PaginationDto) {
    return this.collectionsService.findDeletedCollections(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get collection by ID" })
  @ApiResponse({
    status: 200,
    description: "Collection retrieved successfully",
  })
  @Permissions("read_collection")
  findOne(@Param("id") id: string) {
    return this.collectionsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update collection by ID" })
  @ApiResponse({ status: 200, description: "Collection updated successfully" })
  @Permissions("update_collection")
  update(
    @Param("id") id: string,
    @Body() updateCollectionDto: UpdateCollectionDto
  ) {
    return this.collectionsService.update(id, updateCollectionDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete collection by ID" })
  @ApiResponse({ status: 200, description: "Collection deleted successfully" })
  @Permissions("delete_collection")
  remove(@Param("id") id: string) {
    return this.collectionsService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted collection by ID" })
  @ApiResponse({ status: 200, description: "Collection restored successfully" })
  @Permissions("update_collection")
  restore(@Param("id") id: string) {
    return this.collectionsService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status collection by IDs" })
  @ApiResponse({ status: 200, description: "Collections updated successfully" })
  @Permissions("update_collection")
  async updateStatusByIds(@Body() body: UpdateCollectionStatusDto) {
    const { ids, status } = body;
    return this.collectionsService.updateStatusByIds(ids, status);
  }
}
