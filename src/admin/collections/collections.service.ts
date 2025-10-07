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

  async create(
    createCollectionDto: CreateCollectionDto,
    userId: string
  ): Promise<Collection> {
    // Check for unique name
    const existing = await this.collectionsRepository.findOne({
      where: { name: createCollectionDto.name },
    });
    if (existing) {
      throw new ConflictException("Collection name must be unique");
    }
    let baseSlug = slugify(createCollectionDto.name, {
      lower: true,
      strict: true,
    });
    let slug = baseSlug;
    let count = 1;

    // Ensure uniqueness
    while (await this.collectionsRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const collection = this.collectionsRepository.create({
      ...createCollectionDto,
      slug,
      user: { id: userId },
    });

    // Handle file associations
    if (createCollectionDto.fileIds && createCollectionDto.fileIds.length > 0) {
      const files = await this.filesRepository.findBy({
        id: In(createCollectionDto.fileIds),
      });
      collection.files = files;
    }

    const savedCollection = await this.collectionsRepository.save(collection);
    return this.findOne(savedCollection.id);
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findCollectionsWithFilters(paginationDto, false);
  }

  async findDeletedCollections(paginationDto: PaginationDto): Promise<any> {
    return this.findCollectionsWithFilters(paginationDto, true);
  }

  private async findCollectionsWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status } = paginationDto;
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

    if (status) {
      queryBuilder.andWhere("collection.status = :status", { status });
    }

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

  async findOne(id: string): Promise<any> {
    const collection = await this.collectionsRepository.findOne({
      where: { id },
      relations: ["files"],
    });
    if (!collection) {
      throw new NotFoundException("Collection not found");
    }
    return toCollectionResource(collection);
  }

  async update(
    id: string,
    updateCollectionDto: UpdateCollectionDto
  ): Promise<Collection> {
    const collection = await this.collectionsRepository.findOne({
      where: { id },
      relations: ["files"],
    });

    if (!collection) {
      throw new NotFoundException("Collection not found");
    }

    // Check for unique name (exclude current record)
    if (updateCollectionDto.name) {
      const existing = await this.collectionsRepository.findOne({
        where: { name: updateCollectionDto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException("Collection name must be unique");
      }
    }

    // Handle file associations
    if (updateCollectionDto.fileIds !== undefined) {
      if (updateCollectionDto.fileIds.length > 0) {
        const files = await this.filesRepository.findBy({
          id: In(updateCollectionDto.fileIds),
        });
        collection.files = files;
      } else {
        collection.files = [];
      }
    }

    // Remove fileIds from the DTO before assigning to avoid TypeORM issues
    const { fileIds, ...updateData } = updateCollectionDto;
    Object.assign(collection, updateData);

    const savedCollection = await this.collectionsRepository.save(collection);
    return this.findOne(savedCollection.id);
  }

  async remove(id: string): Promise<void> {
    const collection = await this.findOne(id);
    await this.collectionsRepository.softRemove(collection);
  }

  async restore(id: string): Promise<void> {
    await this.collectionsRepository.restore(id);
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
        await this.collectionsRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.collectionsRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.collectionsRepository.update({ id: In(ids) }, { status: status as EntityStatus });
        break;
    }

    const updated = await this.collectionsRepository.find({
      where: { id: In(ids) },
      relations: ["files"],
    });

    return {
      status: "success",
      message: "Collections updated successfully",
      items: updated.map(toCollectionResource),
    };
  }
}
