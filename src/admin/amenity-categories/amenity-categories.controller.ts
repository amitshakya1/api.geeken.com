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
import { AmenityCategoriesService } from "./amenity-categories.service";
import { CreateAmenityCategoryDto } from "./dto/create-amenity-category.dto";
import { UpdateAmenityCategoryDto } from "./dto/update-amenity-category.dto";
import { UpdateAmenityCategoryStatusDto } from "./dto/update-amenity-category-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("amenity-categories")
@Controller("admin/amenity-categories")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class AmenityCategoriesController {
  constructor(private readonly amenitiesService: AmenityCategoriesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new amenity category" })
  @ApiResponse({
    status: 201,
    description: "Amenity category created successfully",
  })
  @Permissions("create_amenity_category")
  create(
    @Body() createAmenityCategoryDto: CreateAmenityCategoryDto,
    @CurrentUser() user
  ) {
    return this.amenitiesService.create(createAmenityCategoryDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: "Get all amenity categories with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Amenity categories retrieved successfully",
  })
  @Permissions("read_amenity_category")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.amenitiesService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary:
      "Get all soft-deleted amenity categories with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted amenity categories retrieved successfully",
  })
  @Permissions("read_amenity_category")
  findDeletedAmenityCategorries(@Query() paginationDto: PaginationDto) {
    return this.amenitiesService.findDeletedAmenityCategorries(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get amenity category by ID" })
  @ApiResponse({
    status: 200,
    description: "Amenity category retrieved successfully",
  })
  @Permissions("read_amenity_category")
  findOne(@Param("id") id: string) {
    return this.amenitiesService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update amenity category by ID" })
  @ApiResponse({
    status: 200,
    description: "Amenity category updated successfully",
  })
  @Permissions("update_amenity_category")
  update(
    @Param("id") id: string,
    @Body() updateAmenityCategoryDto: UpdateAmenityCategoryDto
  ) {
    return this.amenitiesService.update(id, updateAmenityCategoryDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete amenity category by ID" })
  @ApiResponse({
    status: 200,
    description: "Amenity category deleted successfully",
  })
  @Permissions("delete_amenity_category")
  remove(@Param("id") id: string) {
    return this.amenitiesService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted amenity category by ID" })
  @ApiResponse({
    status: 200,
    description: "Amenity category restored successfully",
  })
  @Permissions("update_amenity_category")
  restore(@Param("id") id: string) {
    return this.amenitiesService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status amenity category by IDs" })
  @ApiResponse({
    status: 200,
    description: "Amenity categories updated successfully",
  })
  @Permissions("update_amenity_category")
  async updateStatusByIds(@Body() body: UpdateAmenityCategoryStatusDto) {
    const { ids, status } = body;
    return this.amenitiesService.updateStatusByIds(ids, status);
  }
}
