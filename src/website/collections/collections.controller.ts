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
import { CollectionsService } from "./collections.service";
import { CreateCollectionDto } from "./dto/create-collection.dto";
import { UpdateCollectionDto } from "./dto/update-collection.dto";
import { UpdateCollectionStatusDto } from "./dto/update-collection-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("collections")
@Controller("website/collections")
@UseInterceptors(ResponseInterceptor)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) { }

  @Get()
  @ApiOperation({ summary: "Get all collections with pagination and search" })
  @ApiResponse({
    status: 200,
    description: "Collections retrieved successfully",
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.collectionsService.findAll(paginationDto);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get collection by slug" })
  @ApiResponse({
    status: 200,
    description: "Collection retrieved successfully",
  })
  findOne(@Param("slug") slug: string) {
    return this.collectionsService.findOne(slug);
  }


}
