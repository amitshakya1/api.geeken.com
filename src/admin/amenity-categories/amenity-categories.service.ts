import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AmenityCategory } from "../../common/entities/amenity-category.entity";
import { CreateAmenityCategoryDto } from "./dto/create-amenity-category.dto";
import { UpdateAmenityCategoryDto } from "./dto/update-amenity-category.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toAmenityCategoryResource } from "./amenity-category.resource";
import { Repository, In } from "typeorm";
import { EntityStatus } from "../../common/enums/status.enum";

@Injectable()
export class AmenityCategoriesService {
  constructor(
    @InjectRepository(AmenityCategory)
    private amenitiesRepository: Repository<AmenityCategory>
  ) { }

  async create(
    createAmenityCategoryDto: CreateAmenityCategoryDto,
    userId: string
  ): Promise<AmenityCategory> {
    // Check for unique name
    const existing = await this.amenitiesRepository.findOne({
      where: { name: createAmenityCategoryDto.name },
    });
    if (existing) {
      throw new ConflictException("Amenity category name must be unique");
    }
    const amenity = this.amenitiesRepository.create({
      ...createAmenityCategoryDto,
      user: { id: userId },
    });
    const savedAmenity = await this.amenitiesRepository.save(amenity);
    return this.findOne(savedAmenity.id);
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findAmenitiesWithFilters(paginationDto, false);
  }

  async findDeletedAmenityCategorries(
    paginationDto: PaginationDto
  ): Promise<any> {
    return this.findAmenitiesWithFilters(paginationDto, true);
  }

  private async findAmenitiesWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status } = paginationDto;
    const skip = (page - 1) * limit;
    const queryBuilder =
      this.amenitiesRepository.createQueryBuilder("amenity_category");
    if (includeDeleted) {
      queryBuilder
        .withDeleted()
        .where("amenity_category.deletedAt IS NOT NULL");
    }
    if (search) {
      const searchCondition = "amenity_category.name ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }
    if (status) {
      queryBuilder.andWhere("amenity_category.status = :status", { status });
    }
    const [amenityCategories, total] = await queryBuilder
      .orderBy(
        includeDeleted
          ? "amenity_category.deletedAt"
          : "amenity_category.createdAt",
        "DESC"
      )
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    return {
      status: "success",
      message: includeDeleted
        ? "Deleted amenityCategories retrieved successfully"
        : "Amenity categories retrieved successfully",
      items: amenityCategories.map(toAmenityCategoryResource),
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

  async findOne(id: string): Promise<any> {
    const amenity = await this.amenitiesRepository.findOne({
      where: { id },
      relations: ["user"],
    });
    if (!amenity) {
      throw new NotFoundException("Amenity category not found");
    }
    return toAmenityCategoryResource(amenity);
  }

  async update(
    id: string,
    updateAmenityCategoryDto: UpdateAmenityCategoryDto
  ): Promise<AmenityCategory> {
    const amenity = await this.amenitiesRepository.findOne({
      where: { id },
    });
    if (!amenity) {
      throw new NotFoundException("Amenity category not found");
    }
    // Check for unique name (exclude current record)
    if (updateAmenityCategoryDto.name) {
      const existing = await this.amenitiesRepository.findOne({
        where: { name: updateAmenityCategoryDto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException("Amenity category name must be unique");
      }
    }
    Object.assign(amenity, updateAmenityCategoryDto);

    const savedAmenity = await this.amenitiesRepository.save(amenity);
    return this.findOne(savedAmenity.id);
  }

  async remove(id: string): Promise<void> {
    const amenity = await this.amenitiesRepository.findOne({ where: { id } });
    if (!amenity) {
      throw new NotFoundException("Amenity category not found");
    }
    await this.amenitiesRepository.softRemove(amenity);
  }

  async restore(id: string): Promise<void> {
    await this.amenitiesRepository.restore(id);
  }

  async updateStatusByIds(ids: string[], status: string): Promise<any> {
    if (!ids || ids.length === 0) {
      return {
        status: "success",
        message: "No IDs provided; nothing to update",
        items: [],
      };
    }

    switch (status) {
      case "restore":
        await this.amenitiesRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.amenitiesRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.amenitiesRepository.update({ id: In(ids) }, { status: status as EntityStatus });
        break;
    }

    const updated = await this.amenitiesRepository.find({
      where: { id: In(ids) },
      relations: ["user"],
    });

    return {
      status: "success",
      message: "Amenity categories updated successfully",
      items: updated.map(toAmenityCategoryResource),
    };
  }
}
