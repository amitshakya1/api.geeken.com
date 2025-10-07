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
import { TestimonialsService } from "./testimonials.service";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";
import { UpdateTestimonialStatusDto } from "./dto/update-testimonial-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("testimonials")
@Controller("admin/testimonials")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new testimonial" })
  @ApiResponse({ status: 201, description: "Testimonial created successfully" })
  @Permissions("create_testimonial")
  create(
    @Body() createTestimonialDto: CreateTestimonialDto,
    @CurrentUser() user
  ) {
    return this.testimonialsService.create(createTestimonialDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all testimonials with pagination and search" })
  @ApiResponse({
    status: 200,
    description: "Testimonials retrieved successfully",
  })
  @Permissions("read_testimonial")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.testimonialsService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted testimonials with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted testimonials retrieved successfully",
  })
  @Permissions("read_testimonial")
  findDeletedTestimonials(@Query() paginationDto: PaginationDto) {
    return this.testimonialsService.findDeletedTestimonials(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get testimonial by ID" })
  @ApiResponse({
    status: 200,
    description: "Testimonial retrieved successfully",
  })
  @Permissions("read_testimonial")
  findOne(@Param("id") id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update testimonial by ID" })
  @ApiResponse({ status: 200, description: "Testimonial updated successfully" })
  @Permissions("update_testimonial")
  update(
    @Param("id") id: string,
    @Body() updateTestimonialDto: UpdateTestimonialDto
  ) {
    return this.testimonialsService.update(id, updateTestimonialDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete testimonial by ID" })
  @ApiResponse({ status: 200, description: "Testimonial deleted successfully" })
  @Permissions("delete_testimonial")
  remove(@Param("id") id: string) {
    return this.testimonialsService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted testimonial by ID" })
  @ApiResponse({
    status: 200,
    description: "Testimonial restored successfully",
  })
  @Permissions("update_testimonial")
  restore(@Param("id") id: string) {
    return this.testimonialsService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status testimonials by IDs" })
  @ApiResponse({
    status: 200,
    description: "Testimonials updated successfully",
  })
  @Permissions("update_testimonial")
  async updateStatusByIds(@Body() body: UpdateTestimonialStatusDto) {
    const { ids, status } = body;
    return this.testimonialsService.updateStatusByIds(ids, status);
  }
}
