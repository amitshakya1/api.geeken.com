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
import { DiscountsService } from "./discounts.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";
import { UpdateDiscountStatusDto } from "./dto/update-discount-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Website - Discounts")
@Controller("website/discounts")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new discount" })
  @ApiResponse({ status: 201, description: "Discount created successfully" })
  @Permissions("create_discount")
  create(@Body() createDiscountDto: CreateDiscountDto, @CurrentUser() user) {
    return this.discountsService.create(createDiscountDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all discounts with pagination and search" })
  @ApiResponse({ status: 200, description: "Discounts retrieved successfully" })
  @Permissions("read_discount")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.discountsService.findAll(paginationDto);
  }

  @Get("active")
  @ApiOperation({ summary: "Get all active public discounts" })
  @ApiResponse({
    status: 200,
    description: "Active discounts retrieved successfully",
  })
  getActiveDiscounts() {
    return this.discountsService.getActiveDiscounts();
  }

  @Get("promo/:promoCode")
  @ApiOperation({ summary: "Get discount by promo code" })
  @ApiResponse({ status: 200, description: "Discount retrieved successfully" })
  findByPromoCode(@Param("promoCode") promoCode: string) {
    return this.discountsService.findByPromoCode(promoCode);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted discounts with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted discounts retrieved successfully",
  })
  @Permissions("read_discount")
  findDeletedDiscounts(@Query() paginationDto: PaginationDto) {
    return this.discountsService.findDeletedDiscounts(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get discount by ID" })
  @ApiResponse({ status: 200, description: "Discount retrieved successfully" })
  @Permissions("read_discount")
  findOne(@Param("id") id: string) {
    return this.discountsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update discount by ID" })
  @ApiResponse({ status: 200, description: "Discount updated successfully" })
  @Permissions("update_discount")
  update(
    @Param("id") id: string,
    @Body() updateDiscountDto: UpdateDiscountDto
  ) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete discount by ID" })
  @ApiResponse({ status: 200, description: "Discount deleted successfully" })
  @Permissions("delete_discount")
  remove(@Param("id") id: string) {
    return this.discountsService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted discount by ID" })
  @ApiResponse({ status: 200, description: "Discount restored successfully" })
  @Permissions("update_discount")
  restore(@Param("id") id: string) {
    return this.discountsService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status discount by IDs" })
  @ApiResponse({ status: 200, description: "Discounts updated successfully" })
  @Permissions("update_discount")
  async updateStatusByIds(@Body() body: UpdateDiscountStatusDto) {
    const { ids, status } = body;
    return this.discountsService.updateStatusByIds(ids, status);
  }
}
