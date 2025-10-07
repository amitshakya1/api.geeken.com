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
import { EnquiriesService } from "./enquiries.service";
import { CreateEnquiryDto } from "./dto/create-enquiry.dto";
import { UpdateEnquiryDto } from "./dto/update-enquiry.dto";
import { UpdateEnquiryStatusDto } from "./dto/update-enquiry-status.dto";
import { PaginationWithTypeDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Website - Enquiries")
@Controller("website/enquiries")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new enquiry" })
  @ApiResponse({ status: 201, description: "Enquiry created successfully" })
  @Permissions("create_enquiry", "create_ticket")
  create(@Body() createEnquiryDto: CreateEnquiryDto, @CurrentUser() user) {
    return this.enquiriesService.create(createEnquiryDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all enquiries with pagination and search" })
  @ApiResponse({ status: 200, description: "Enquiries retrieved successfully" })
  @Permissions("read_enquiry", "read_ticket")
  findAll(@Query() paginationDto: PaginationWithTypeDto) {
    return this.enquiriesService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted enquiries with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted enquiries retrieved successfully",
  })
  @Permissions("read_enquiry", "read_ticket")
  findDeletedEnquiries(@Query() paginationDto: PaginationWithTypeDto) {
    return this.enquiriesService.findDeletedEnquiries(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get enquiry by ID" })
  @ApiResponse({ status: 200, description: "Enquiry retrieved successfully" })
  @Permissions("read_enquiry", "read_ticket")
  findOne(@Param("id") id: string) {
    return this.enquiriesService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update enquiry by ID" })
  @ApiResponse({ status: 200, description: "Enquiry updated successfully" })
  @Permissions("update_enquiry", "update_ticket")
  update(
    @Param("id") id: string,
    @Body() updateEnquiryDto: UpdateEnquiryDto,
    @CurrentUser() user
  ) {
    return this.enquiriesService.update(id, updateEnquiryDto, user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete enquiry by ID" })
  @ApiResponse({ status: 200, description: "Enquiry deleted successfully" })
  @Permissions("delete_enquiry", "delete_ticket")
  remove(@Param("id") id: string) {
    return this.enquiriesService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted enquiry by ID" })
  @ApiResponse({ status: 200, description: "Enquiry restored successfully" })
  @Permissions("update_enquiry", "update_ticket")
  restore(@Param("id") id: string) {
    return this.enquiriesService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status enquiry by IDs" })
  @ApiResponse({ status: 200, description: "Enquiries updated successfully" })
  @Permissions("update_enquiry", "update_ticket")
  async updateStatusByIds(@Body() body: UpdateEnquiryStatusDto) {
    const { ids, status } = body;
    return this.enquiriesService.updateStatusByIds(ids, status);
  }
}
