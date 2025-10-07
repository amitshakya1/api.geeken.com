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
import { TestimonialsService } from "./testimonials.service";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";

@ApiTags("testimonials")
@Controller("website/testimonials")
@UseInterceptors(ResponseInterceptor)
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) { }

  @Get()
  @ApiOperation({ summary: "Get all testimonials with pagination and search" })
  @ApiResponse({
    status: 200,
    description: "Testimonials retrieved successfully",
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.testimonialsService.findAll(paginationDto);
  }
}
