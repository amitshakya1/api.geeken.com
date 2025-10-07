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
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { UpdateProductStatusDto } from "./dto/update-product-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("products")
@Controller("admin/products")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  @Permissions("create_product")
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user) {
    return this.productsService.create(createProductDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all products with pagination and search" })
  @ApiResponse({ status: 200, description: "Products retrieved successfully" })
  @Permissions("read_product")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted products with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted products retrieved successfully",
  })
  @Permissions("read_product")
  findDeletedProducts(@Query() paginationDto: PaginationDto) {
    return this.productsService.findDeletedProducts(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product by ID" })
  @ApiResponse({ status: 200, description: "Product retrieved successfully" })
  @Permissions("read_product")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update product by ID" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @Permissions("update_product")
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete product by ID" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  @Permissions("delete_product")
  remove(@Param("id") id: string) {
    return this.productsService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted product by ID" })
  @ApiResponse({ status: 200, description: "Product restored successfully" })
  @Permissions("update_product")
  restore(@Param("id") id: string) {
    return this.productsService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status products by IDs" })
  @ApiResponse({ status: 200, description: "Products updated successfully" })
  @Permissions("update_product")
  async updateStatusByIds(@Body() body: UpdateProductStatusDto) {
    const { ids, status } = body;
    return this.productsService.updateStatusByIds(ids, status);
  }
}
