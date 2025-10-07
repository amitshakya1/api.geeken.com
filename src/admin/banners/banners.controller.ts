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
import { BannersService } from "./banners.service";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";
import { UpdateBannerStatusDto } from "./dto/update-banner-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("banners")
@Controller("admin/banners")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new banner" })
  @ApiResponse({ status: 201, description: "Banner created successfully" })
  @Permissions("create_banner")
  create(@Body() createBannerDto: CreateBannerDto, @CurrentUser() user) {
    return this.bannersService.create(createBannerDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all banners with pagination and search" })
  @ApiResponse({ status: 200, description: "Banners retrieved successfully" })
  @Permissions("read_banner")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.bannersService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted banners with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted banners retrieved successfully",
  })
  @Permissions("read_banner")
  findDeletedBanners(@Query() paginationDto: PaginationDto) {
    return this.bannersService.findDeletedBanners(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get banner by ID" })
  @ApiResponse({ status: 200, description: "Banner retrieved successfully" })
  @Permissions("read_banner")
  findOne(@Param("id") id: string) {
    return this.bannersService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update banner by ID" })
  @ApiResponse({ status: 200, description: "Banner updated successfully" })
  @Permissions("update_banner")
  update(@Param("id") id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannersService.update(id, updateBannerDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete banner by ID" })
  @ApiResponse({ status: 200, description: "Banner deleted successfully" })
  @Permissions("delete_banner")
  remove(@Param("id") id: string) {
    return this.bannersService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted banner by ID" })
  @ApiResponse({ status: 200, description: "Banner restored successfully" })
  @Permissions("update_banner")
  restore(@Param("id") id: string) {
    return this.bannersService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status banners by IDs" })
  @ApiResponse({ status: 200, description: "Banners updated successfully" })
  @Permissions("update_banner")
  async updateStatusByIds(@Body() body: UpdateBannerStatusDto) {
    const { ids, status } = body;
    return this.bannersService.updateStatusByIds(ids, status);
  }
}
