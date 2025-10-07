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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ProductVariantsService } from "./product-variants.service";
import { CreateProductVariantDto } from "./dto/create-product-variant.dto";
import { UpdateProductVariantDto } from "./dto/update-product-variant.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { EntityStatus } from "../../common/enums/status.enum";

@ApiTags("Website - Product Variants")
@Controller("website/product-variants")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new product variant" })
  @ApiResponse({
    status: 201,
    description: "Product variant created successfully",
  })
  @Permissions("create_product_variant")
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(createProductVariantDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all product variants with optional product filter",
  })
  @ApiResponse({
    status: 200,
    description: "Product variants retrieved successfully",
  })
  @Permissions("read_product_variant")
  findAll(@Query("productId") productId?: string) {
    return this.productVariantsService.findAll(productId);
  }

  @Get("product/:productId")
  @ApiOperation({ summary: "Get all variants for a specific product" })
  @ApiResponse({
    status: 200,
    description: "Product variants retrieved successfully",
  })
  @Permissions("read_product_variant")
  findByProductId(@Param("productId") productId: string) {
    return this.productVariantsService.findByProductId(productId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product variant by ID" })
  @ApiResponse({
    status: 200,
    description: "Product variant retrieved successfully",
  })
  @Permissions("read_product_variant")
  findOne(@Param("id") id: string) {
    return this.productVariantsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update product variant by ID" })
  @ApiResponse({
    status: 200,
    description: "Product variant updated successfully",
  })
  @Permissions("update_product_variant")
  update(
    @Param("id") id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto
  ) {
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete product variant by ID" })
  @ApiResponse({
    status: 200,
    description: "Product variant deleted successfully",
  })
  @Permissions("delete_product_variant")
  remove(@Param("id") id: string) {
    return this.productVariantsService.remove(id);
  }

  @Patch(":id/stock")
  @ApiOperation({ summary: "Update product variant stock quantity" })
  @ApiResponse({
    status: 200,
    description: "Product variant stock updated successfully",
  })
  @Permissions("update_product_variant")
  updateStock(@Param("id") id: string, @Body() body: { quantity: number }) {
    return this.productVariantsService.updateStock(id, body.quantity);
  }

  @Patch(":id/default")
  @ApiOperation({ summary: "Set product variant as default" })
  @ApiResponse({
    status: 200,
    description: "Product variant set as default successfully",
  })
  @Permissions("update_product_variant")
  setDefault(@Param("id") id: string) {
    return this.productVariantsService.setDefault(id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update product variant status" })
  @ApiResponse({
    status: 200,
    description: "Product variant status updated successfully",
  })
  @Permissions("update_product_variant")
  updateStatus(
    @Param("id") id: string,
    @Body() body: { status: EntityStatus }
  ) {
    return this.productVariantsService.updateStatus(id, body.status);
  }
}
