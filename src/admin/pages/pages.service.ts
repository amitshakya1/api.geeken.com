import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Page } from "../../common/entities/page.entity";
import { File } from "../../common/entities/file.entity";
import { CreatePageDto } from "./dto/create-page.dto";
import { UpdatePageDto } from "./dto/update-page.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toPageResource } from "./page.resource";
import slugify from "slugify";
import { EntityStatus } from "../../common/enums/status.enum";

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pagesRepository: Repository<Page>,
    @InjectRepository(File)
    private filesRepository: Repository<File>
  ) { }

  async create(createPageDto: CreatePageDto, userId: string): Promise<Page> {
    let baseSlug = slugify(createPageDto.name, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    // Ensure uniqueness
    while (await this.pagesRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const page = this.pagesRepository.create({
      ...createPageDto,
      slug,
      user: { id: userId },
    });

    // Handle file associations
    if (createPageDto.fileIds && createPageDto.fileIds.length > 0) {
      const files = await this.filesRepository.findBy({
        id: In(createPageDto.fileIds),
      });
      page.files = files;
    }

    const savedPage = await this.pagesRepository.save(page);
    return this.findOne(savedPage.id);
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findPagesWithFilters(paginationDto, false);
  }

  async findDeletedPages(paginationDto: PaginationDto): Promise<any> {
    return this.findPagesWithFilters(paginationDto, true);
  }

  private async findPagesWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.pagesRepository
      .createQueryBuilder("page")
      .leftJoinAndSelect("page.files", "files");

    if (includeDeleted) {
      queryBuilder.withDeleted().where("page.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "page.name ILIKE :search OR page.description ILIKE :search OR page.tagLine ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    if (status) {
      queryBuilder.andWhere("page.status = :status", { status });
    }

    const [pages, total] = await queryBuilder
      .orderBy(includeDeleted ? "page.deletedAt" : "page.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted pages retrieved successfully"
        : "Pages retrieved successfully",
      items: pages.map(toPageResource),
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
    const page = await this.pagesRepository.findOne({
      where: { id },
      relations: ["files"],
    });
    if (!page) {
      throw new NotFoundException("Page not found");
    }
    return toPageResource(page);
  }

  async update(id: string, updatePageDto: UpdatePageDto): Promise<Page> {
    const page = await this.pagesRepository.findOne({
      where: { id },
      relations: ["files"],
    });

    if (!page) {
      throw new NotFoundException("Page not found");
    }

    // Handle file associations
    if (updatePageDto.fileIds !== undefined) {
      if (updatePageDto.fileIds.length > 0) {
        const files = await this.filesRepository.findBy({
          id: In(updatePageDto.fileIds),
        });
        page.files = files;
      } else {
        page.files = [];
      }
    }

    // Remove fileIds from the DTO before assigning to avoid TypeORM issues
    const { fileIds, ...updateData } = updatePageDto;
    Object.assign(page, updateData);

    const savedPage = await this.pagesRepository.save(page);
    return this.findOne(savedPage.id);
  }

  async remove(id: string): Promise<void> {
    const page = await this.findOne(id);
    await this.pagesRepository.softRemove(page);
  }

  async restore(id: string): Promise<void> {
    await this.pagesRepository.restore(id);
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
        await this.pagesRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.pagesRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.pagesRepository.update({ id: In(ids) }, { status: status as EntityStatus });
        break;
    }

    // Use withDeleted() to include soft-deleted records in the response
    // This ensures we get all updated records regardless of their deletion status
    const updated = await this.pagesRepository.find({
      where: { id: In(ids) },
      relations: ["files"],
      withDeleted: true,
    });

    return {
      status: "success",
      message: "Pages updated successfully",
      items: updated.map(toPageResource),
    };
  }
}
