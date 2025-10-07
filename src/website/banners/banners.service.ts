import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Banner } from "../../common/entities/banner.entity";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toBannerResource } from "./banner.resource";
import { EntityStatus } from "../../common/enums/status.enum";

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>
  ) { }


  async findAll(paginationDto: PaginationDto) {
    return this.findBannersWithFilters(paginationDto, false);
  }

  private async findBannersWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ) {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.bannerRepository
      .createQueryBuilder("banner")
      .leftJoinAndSelect("banner.user", "user")
      .leftJoinAndSelect("banner.mobileImage", "mobileImage")
      .leftJoinAndSelect("banner.desktopImage", "desktopImage");

    if (includeDeleted) {
      queryBuilder.withDeleted().where("banner.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "banner.name ILIKE :search OR banner.tagLine ILIKE :search OR banner.description ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    queryBuilder.andWhere("user.status = :status", { status: EntityStatus.ACTIVE });

    const [banners, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy(includeDeleted ? "banner.deletedAt" : "banner.createdAt", "DESC")
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted banners retrieved successfully"
        : "Banners retrieved successfully",
      items: banners.map(toBannerResource),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
