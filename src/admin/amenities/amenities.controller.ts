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
import { AmenitiesService } from "./amenities.service";
import { CreateAmenityDto } from "./dto/create-amenity.dto";
import { UpdateAmenityDto } from "./dto/update-amenity.dto";
import { UpdateAmenityStatusDto } from "./dto/update-amenity-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("amenities")
@Controller("admin/amenities")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new amenity" })
  @ApiResponse({ status: 201, description: "Amenity created successfully" })
  @Permissions("create_amenity")
  create(@Body() createAmenityDto: CreateAmenityDto, @CurrentUser() user) {
    return this.amenitiesService.create(createAmenityDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all amenities with pagination and search" })
  @ApiResponse({ status: 200, description: "Amenities retrieved successfully" })
  @Permissions("read_amenity")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.amenitiesService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted amenities with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted amenities retrieved successfully",
  })
  @Permissions("read_amenity")
  findDeletedamenities(@Query() paginationDto: PaginationDto) {
    return this.amenitiesService.findDeletedAmenities(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get amenity by ID" })
  @ApiResponse({ status: 200, description: "Amenity retrieved successfully" })
  @Permissions("read_amenity")
  findOne(@Param("id") id: string) {
    return this.amenitiesService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update amenity by ID" })
  @ApiResponse({ status: 200, description: "Amenity updated successfully" })
  @Permissions("update_amenity")
  update(@Param("id") id: string, @Body() updateAmenityDto: UpdateAmenityDto) {
    return this.amenitiesService.update(id, updateAmenityDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete amenity by ID" })
  @ApiResponse({ status: 200, description: "Amenity deleted successfully" })
  @Permissions("delete_amenity")
  remove(@Param("id") id: string) {
    return this.amenitiesService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted amenity by ID" })
  @ApiResponse({ status: 200, description: "Amenity restored successfully" })
  @Permissions("update_amenity")
  restore(@Param("id") id: string) {
    return this.amenitiesService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status amenity by IDs" })
  @ApiResponse({ status: 200, description: "Amenities updated successfully" })
  @Permissions("update_amenity")
  async updateStatusByIds(@Body() body: UpdateAmenityStatusDto) {
    const { ids, status } = body;
    return this.amenitiesService.updateStatusByIds(ids, status);
  }
}
