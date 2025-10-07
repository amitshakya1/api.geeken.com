import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Amenity } from "../../common/entities/amenity.entity";
import { CreateAmenityDto } from "./dto/create-amenity.dto";
import { UpdateAmenityDto } from "./dto/update-amenity.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toAmenityResource } from "./amenity.resource";
import { Repository, In } from "typeorm";
import { EntityStatus } from "../../common/enums/status.enum";

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>
  ) { }

  async create(
    createAmenityDto: CreateAmenityDto,
    userId: string
  ): Promise<Amenity> {
    const { amenityCategoryId, name, ...rest } = createAmenityDto;
    const existing = await this.amenityRepository.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException("Amenity name already exists");
    }
    const amenity = this.amenityRepository.create({
      ...rest,
      name,
      user: { id: userId },
      amenityCategoryId: amenityCategoryId,
    });
    const savedAmenity = await this.amenityRepository.save(amenity);
    return this.findOne(savedAmenity.id);
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findAmenitiesWithFilters(paginationDto, false);
  }

  async findDeletedAmenities(paginationDto: PaginationDto): Promise<any> {
    return this.findAmenitiesWithFilters(paginationDto, true);
  }

  private async findAmenitiesWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status } = paginationDto;
    const skip = (page - 1) * limit;
    const queryBuilder = this.amenityRepository
      .createQueryBuilder("amenity")
      .leftJoinAndSelect("amenity.amenityCategory", "amenityCategory");
    if (includeDeleted) {
      queryBuilder.withDeleted().where("amenity.deletedAt IS NOT NULL");
    }
    if (search) {
      const searchCondition = "amenity.name ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }
    if (status) {
      queryBuilder.andWhere("amenity.status = :status", { status });
    }
    const [amenities, total] = await queryBuilder
      .orderBy(
        includeDeleted ? "amenity.deletedAt" : "amenity.createdAt",
        "DESC"
      )
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    return {
      status: "success",
      message: includeDeleted
        ? "Deleted amenities retrieved successfully"
        : "Amenities retrieved successfully",
      items: amenities.map(toAmenityResource),
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
    const amenity = await this.amenityRepository.findOne({
      where: { id },
      relations: ["user", "amenityCategory"],
    });
    if (!amenity) {
      throw new NotFoundException("Amenity not found");
    }
    return toAmenityResource(amenity);
  }

  async update(
    id: string,
    updateAmenityDto: UpdateAmenityDto
  ): Promise<Amenity> {
    const amenity = await this.amenityRepository.findOne({
      where: { id },
      relations: ["user", "amenityCategory"],
    });
    if (!amenity) {
      throw new NotFoundException("Amenity not found");
    }

    if (updateAmenityDto.name) {
      const existing = await this.amenityRepository.findOne({
        where: { name: updateAmenityDto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException("Amenity name already exists");
      }
    }

    // Handle amenityCategoryId update separately
    if (updateAmenityDto.amenityCategoryId) {
      amenity.amenityCategory = { id: updateAmenityDto.amenityCategoryId } as any;
    }

    // Remove amenityCategoryId from the DTO before assigning to avoid TypeORM issues
    const { amenityCategoryId, ...updateData } = updateAmenityDto;
    Object.assign(amenity, updateData);

    const savedAmenity = await this.amenityRepository.save(amenity);
    return this.findOne(savedAmenity.id);
  }

  async remove(id: string): Promise<void> {
    const amenity = await this.amenityRepository.findOne({ where: { id } });
    if (!amenity) {
      throw new NotFoundException("Amenity not found");
    }
    await this.amenityRepository.softRemove(amenity);
  }

  async restore(id: string): Promise<void> {
    await this.amenityRepository.restore(id);
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
        await this.amenityRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.amenityRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.amenityRepository.update({ id: In(ids) }, { status: status as EntityStatus });
        break;
    }

    const updated = await this.amenityRepository.find({
      where: { id: In(ids) },
      relations: ["user", "amenityCategory"],
    });

    return {
      status: "success",
      message: "Amenities updated successfully",
      items: updated.map(toAmenityResource),
    };
  }
}
