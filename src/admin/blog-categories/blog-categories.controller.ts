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
import { BlogCategoriesService } from "./blog-categories.service";
import { CreateBlogCategoryDto } from "./dto/create-blog-category.dto";
import { UpdateBlogCategoryDto } from "./dto/update-blog-category.dto";
import { UpdateBlogCategoryStatusDto } from "./dto/update-blog-category-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("blog-categories")
@Controller("admin/blog-categories")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class BlogCategoriesController {
  constructor(private readonly blogCategoriesService: BlogCategoriesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new blog category" })
  @ApiResponse({
    status: 201,
    description: "Blog category created successfully",
  })
  @Permissions("create_blog_category")
  create(
    @Body() createBlogCategoryDto: CreateBlogCategoryDto,
    @CurrentUser() user
  ) {
    return this.blogCategoriesService.create(createBlogCategoryDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: "Get all blog categories with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Blog categories retrieved successfully",
  })
  @Permissions("read_blog_category")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.blogCategoriesService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted blog categories with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted blog categories retrieved successfully",
  })
  @Permissions("read_blog_category")
  findDeletedBlogCategories(@Query() paginationDto: PaginationDto) {
    return this.blogCategoriesService.findDeletedBlogCategories(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get blog category by ID" })
  @ApiResponse({
    status: 200,
    description: "Blog category retrieved successfully",
  })
  @Permissions("read_blog_category")
  findOne(@Param("id") id: string) {
    return this.blogCategoriesService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update blog category by ID" })
  @ApiResponse({
    status: 200,
    description: "Blog category updated successfully",
  })
  @Permissions("update_blog_category")
  update(
    @Param("id") id: string,
    @Body() updateBlogCategoryDto: UpdateBlogCategoryDto
  ) {
    return this.blogCategoriesService.update(id, updateBlogCategoryDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete blog category by ID" })
  @ApiResponse({
    status: 200,
    description: "Blog category deleted successfully",
  })
  @Permissions("delete_blog_category")
  remove(@Param("id") id: string) {
    return this.blogCategoriesService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted blog category by ID" })
  @ApiResponse({
    status: 200,
    description: "Blog category restored successfully",
  })
  @Permissions("update_blog_category")
  restore(@Param("id") id: string) {
    return this.blogCategoriesService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status of blog categories by IDs" })
  @ApiResponse({
    status: 200,
    description: "Blog categories updated successfully",
  })
  @Permissions("update_blog_category")
  async updateStatusByIds(@Body() body: UpdateBlogCategoryStatusDto) {
    const { ids, status } = body;
    return this.blogCategoriesService.updateStatusByIds(ids, status);
  }
}
