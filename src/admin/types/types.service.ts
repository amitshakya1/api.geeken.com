import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Type } from "../../common/entities/type.entity";
import { CreateTypeDto } from "./dto/create-type.dto";
import { UpdateTypeDto } from "./dto/update-type.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toTypeResource } from "./type.resource";
import { Product } from "../../common/entities/product.entity";
import { EntityStatus } from "../../common/enums/status.enum";
import slugify from "slugify";

@Injectable()
export class TypesService {
  constructor(
    @InjectRepository(Type)
    private typesRepository: Repository<Type>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>
  ) { }

  async create(createTypeDto: CreateTypeDto, userId: string): Promise<Type> {
    // Check for unique name
    const existing = await this.typesRepository.findOne({
      where: { name: createTypeDto.name },
    });
    if (existing) {
      throw new ConflictException("Type name must be unique");
    }

    const type = this.typesRepository.create({
      ...createTypeDto,
      user: { id: userId },
    });
    const savedType = await this.typesRepository.save(type);
    return this.findOne(savedType.id);
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findTypesWithFilters(paginationDto, false);
  }

  async findDeletedTypes(paginationDto: PaginationDto): Promise<any> {
    return this.findTypesWithFilters(paginationDto, true);
  }

  private async findTypesWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status } = paginationDto;
    const skip = (page - 1) * limit;
    const queryBuilder = this.typesRepository.createQueryBuilder("type");
    if (includeDeleted) {
      queryBuilder.withDeleted().where("type.deletedAt IS NOT NULL");
    }
    if (search) {
      const searchCondition = "type.name ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }
    if (status) {
      queryBuilder.andWhere("type.status = :status", { status });
    }
    const [types, total] = await queryBuilder
      .orderBy(includeDeleted ? "type.deletedAt" : "type.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    return {
      status: "success",
      message: includeDeleted
        ? "Deleted types retrieved successfully"
        : "Types retrieved successfully",
      items: types.map(toTypeResource),
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
    const type = await this.typesRepository.findOne({
      where: { id },
      relations: ["products", "user"],
    });
    if (!type) {
      throw new NotFoundException("Type not found");
    }
    return toTypeResource(type);
  }

  async update(id: string, updateTypeDto: UpdateTypeDto): Promise<Type> {
    const type = await this.typesRepository.findOne({
      where: { id },
      relations: ["products"],
    });
    if (!type) {
      throw new NotFoundException("Type not found");
    }
    // Check for unique name (exclude current record)
    if (updateTypeDto.name) {
      const existing = await this.typesRepository.findOne({
        where: { name: updateTypeDto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException("Type name must be unique");
      }
    }
    Object.assign(type, updateTypeDto);

    const savedType = await this.typesRepository.save(type);
    return this.findOne(savedType.id);
  }

  async remove(id: string): Promise<void> {
    const type = await this.typesRepository.findOne({ where: { id } });
    if (!type) {
      throw new NotFoundException("Type not found");
    }
    await this.typesRepository.softRemove(type);
  }

  async restore(id: string): Promise<void> {
    await this.typesRepository.restore(id);
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
        await this.typesRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.typesRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.typesRepository.update({ id: In(ids) }, { status: status as EntityStatus });
        break;
    }

    const updated = await this.typesRepository.find({
      where: { id: In(ids) },
      relations: ["products", "user"],
    });

    return {
      status: "success",
      message: "Types updated successfully",
      items: updated.map(toTypeResource),
    };
  }
}
