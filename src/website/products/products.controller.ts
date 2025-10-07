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
import { PaginationDto } from "../../common/dto/pagination.dto";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";

@ApiTags("products")
@Controller("website/products")
@UseInterceptors(ResponseInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  @ApiOperation({ summary: "Get all products with pagination and search" })
  @ApiResponse({ status: 200, description: "Products retrieved successfully" })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get product by slug" })
  @ApiResponse({ status: 200, description: "Product retrieved successfully" })
  findOne(@Param("slug") slug: string) {
    return this.productsService.findOne(slug);
  }


}
