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
import { PagesService } from "./pages.service";
import { CreatePageDto } from "./dto/create-page.dto";
import { UpdatePageDto } from "./dto/update-page.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UpdatePageStatusDto } from "./dto/update-page-status.dto";

@ApiTags("Website - Pages")
@Controller("website/pages")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new page" })
  @ApiResponse({ status: 201, description: "Page created successfully" })
  @Permissions("create_page")
  create(@Body() createPageDto: CreatePageDto, @CurrentUser() user) {
    return this.pagesService.create(createPageDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all pages with pagination and search" })
  @ApiResponse({ status: 200, description: "Pages retrieved successfully" })
  @Permissions("read_page")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.pagesService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted pages with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted pages retrieved successfully",
  })
  @Permissions("read_page")
  findDeletedPages(@Query() paginationDto: PaginationDto) {
    return this.pagesService.findDeletedPages(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get page by ID" })
  @ApiResponse({ status: 200, description: "Page retrieved successfully" })
  @Permissions("read_page")
  findOne(@Param("id") id: string) {
    return this.pagesService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update page by ID" })
  @ApiResponse({ status: 200, description: "Page updated successfully" })
  @Permissions("update_page")
  update(@Param("id") id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete page by ID" })
  @ApiResponse({ status: 200, description: "Page deleted successfully" })
  @Permissions("delete_page")
  remove(@Param("id") id: string) {
    return this.pagesService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted page by ID" })
  @ApiResponse({ status: 200, description: "Page restored successfully" })
  @Permissions("update_page")
  restore(@Param("id") id: string) {
    return this.pagesService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status page by IDs" })
  @ApiResponse({ status: 200, description: "Pages updated successfully" })
  @Permissions("update_page")
  async updateStatusByIds(@Body() body: UpdatePageStatusDto) {
    const { ids, status } = body;
    return this.pagesService.updateStatusByIds(ids, status);
  }
}
