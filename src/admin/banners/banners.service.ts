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

  async create(createBannerDto: CreateBannerDto, userId: string) {
    const { mobileImageId, desktopImageId, ...rest } = createBannerDto;
    const banner = this.bannerRepository.create({
      ...rest,
      user: { id: userId },
      mobileImage: mobileImageId ? { id: mobileImageId } : undefined,
      desktopImage: desktopImageId ? { id: desktopImageId } : undefined,
    });
    const savedBanner = await this.bannerRepository.save(banner);
    return this.findOne(savedBanner.id);
  }

  async findAll(paginationDto: PaginationDto) {
    return this.findBannersWithFilters(paginationDto, false);
  }

  async findOne(id: string): Promise<any> {
    const banner = await this.bannerRepository.findOne({
      where: { id },
      relations: ["user", "mobileImage", "desktopImage"],
    });
    if (!banner) {
      throw new NotFoundException("User not found");
    }
    return toBannerResource(banner);
  }

  async update(id: string, updateBannerDto: UpdateBannerDto) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new Error("Banner not found");
    }
    const { mobileImageId, desktopImageId, ...rest } = updateBannerDto;

    Object.assign(banner, rest);

    if (mobileImageId !== undefined) {
      banner.mobileImage = mobileImageId
        ? ({ id: mobileImageId } as any)
        : null;
    }

    if (desktopImageId !== undefined) {
      banner.desktopImage = desktopImageId
        ? ({ id: desktopImageId } as any)
        : null;
    }

    const savedBanner = await this.bannerRepository.save(banner);
    return this.findOne(savedBanner.id);
  }

  async remove(id: string) {
    return this.bannerRepository.softDelete(id);
  }

  async restore(id: string) {
    return this.bannerRepository.restore(id);
  }

  async updateStatusByIds(ids: string[], status: string) {
    const banners = await this.bannerRepository.findByIds(ids);

    if (banners.length === 0) {
      throw new NotFoundException('No banners found with the provided IDs');
    }

    if (status === 'delete') {
      await this.bannerRepository.softDelete(ids);
      return {
        status: 'success',
        message: 'Banners deleted successfully',
        count: banners.length
      };
    }

    if (status === 'restore') {
      await this.bannerRepository.restore(ids);
      return {
        status: 'success',
        message: 'Banners restored successfully',
        count: banners.length
      };
    }

    // Update status for active, archived, or draft
    await this.bannerRepository.update(ids, { status: status as EntityStatus });

    return {
      status: 'success',
      message: 'Banners updated successfully',
      count: banners.length
    };
  }

  async findDeletedBanners(paginationDto: PaginationDto) {
    return this.findBannersWithFilters(paginationDto, true);
  }

  private async findBannersWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ) {
    const { page = 1, limit = 10, search, status } = paginationDto;
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

    if (status) {
      queryBuilder.andWhere("user.status = :status", { status });
    }

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
