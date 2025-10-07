import {
  Controller,
  Get,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { BannersService } from "./banners.service";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";

@ApiTags("banners")
@Controller("website/banners")
@UseInterceptors(ResponseInterceptor)
export class BannersController {
  constructor(private readonly bannersService: BannersService) { }

  @Get()
  @ApiOperation({ summary: "Get all banners with pagination and search" })
  @ApiResponse({ status: 200, description: "Banners retrieved successfully" })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.bannersService.findAll(paginationDto);
  }

}
