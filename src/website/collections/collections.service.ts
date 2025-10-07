import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Collection } from "../../common/entities/collection.entity";
import { File } from "../../common/entities/file.entity";
import { CreateCollectionDto } from "./dto/create-collection.dto";
import { UpdateCollectionDto } from "./dto/update-collection.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toCollectionResource } from "./collection.resource";
import { EntityStatus } from "../../common/enums/status.enum";
import slugify from "slugify";

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
    @InjectRepository(File)
    private filesRepository: Repository<File>
  ) { }


  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findCollectionsWithFilters(paginationDto, false);
  }


  private async findCollectionsWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.collectionsRepository
      .createQueryBuilder("collection")
      .leftJoinAndSelect("collection.files", "files");

    if (includeDeleted) {
      queryBuilder.withDeleted().where("collection.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "collection.name ILIKE :search OR collection.description ILIKE :search OR collection.tagLine ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    queryBuilder.andWhere("collection.status = :status", { status: EntityStatus.ACTIVE });

    const [collections, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy(
        includeDeleted ? "collection.deletedAt" : "collection.createdAt",
        "DESC"
      )
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted collections retrieved successfully"
        : "Collections retrieved successfully",
      items: collections.map(toCollectionResource),
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

  async findOne(slug: string): Promise<any> {
    const collection = await this.collectionsRepository.findOne({
      where: { slug, status: EntityStatus.ACTIVE },
      relations: ["files"],
    });
    if (!collection) {
      throw new NotFoundException("Collection not found");
    }
    return toCollectionResource(collection);
  }

}
