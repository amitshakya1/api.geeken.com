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
import { BlogsService } from "./blogs.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UpdateBlogStatusDto } from "./dto/update-blog-status.dto";

@ApiTags("Website - Blogs")
@Controller("website/blogs")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new blog" })
  @ApiResponse({ status: 201, description: "Blog created successfully" })
  @Permissions("create_blog")
  create(@Body() createBlogDto: CreateBlogDto, @CurrentUser() user) {
    return this.blogsService.create(createBlogDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all blogs with pagination and search" })
  @ApiResponse({ status: 200, description: "Blogs retrieved successfully" })
  @Permissions("read_blog")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.blogsService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted blogs with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted blogs retrieved successfully",
  })
  @Permissions("read_blog")
  findDeletedBlogs(@Query() paginationDto: PaginationDto) {
    return this.blogsService.findDeletedBlogs(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get blog by ID" })
  @ApiResponse({ status: 200, description: "Blog retrieved successfully" })
  @Permissions("read_blog")
  findOne(@Param("id") id: string) {
    return this.blogsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update blog by ID" })
  @ApiResponse({ status: 200, description: "Blog updated successfully" })
  @Permissions("update_blog")
  update(@Param("id") id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.update(id, updateBlogDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete blog by ID" })
  @ApiResponse({ status: 200, description: "Blog deleted successfully" })
  @Permissions("delete_blog")
  remove(@Param("id") id: string) {
    return this.blogsService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted blog by ID" })
  @ApiResponse({ status: 200, description: "Blog restored successfully" })
  @Permissions("update_blog")
  restore(@Param("id") id: string) {
    return this.blogsService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status blog by IDs" })
  @ApiResponse({ status: 200, description: "Blogs updated successfully" })
  @Permissions("update_blog")
  async updateStatusByIds(@Body() body: UpdateBlogStatusDto) {
    const { ids, status } = body;
    return this.blogsService.updateStatusByIds(ids, status);
  }
}
