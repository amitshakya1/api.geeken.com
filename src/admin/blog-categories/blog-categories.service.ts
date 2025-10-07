import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogCategory } from "../../common/entities/blog-category.entity";
import { CreateBlogCategoryDto } from "./dto/create-blog-category.dto";
import { UpdateBlogCategoryDto } from "./dto/update-blog-category.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toBlogCategoryResource } from "./blog-category.resource";
import { Repository, In } from "typeorm";
import { EntityStatus } from "../../common/enums/status.enum";

@Injectable()
export class BlogCategoriesService {
  constructor(
    @InjectRepository(BlogCategory)
    private blogCategoriesRepository: Repository<BlogCategory>
  ) { }

  async create(
    createBlogCategoryDto: CreateBlogCategoryDto,
    userId: string
  ): Promise<BlogCategory> {
    // Check for unique name
    const existing = await this.blogCategoriesRepository.findOne({
      where: { name: createBlogCategoryDto.name },
    });
    if (existing) {
      throw new ConflictException("Blog category name must be unique");
    }
    const blog = this.blogCategoriesRepository.create({
      ...createBlogCategoryDto,
      user: { id: userId },
    });
    const savedBlog = await this.blogCategoriesRepository.save(blog);
    return this.findOne(savedBlog.id);
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findBlogsWithFilters(paginationDto, false);
  }

  async findDeletedBlogCategories(
    paginationDto: PaginationDto
  ): Promise<any> {
    return this.findBlogsWithFilters(paginationDto, true);
  }

  private async findBlogsWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status } = paginationDto;
    const skip = (page - 1) * limit;
    const queryBuilder =
      this.blogCategoriesRepository.createQueryBuilder("blog_category");
    if (includeDeleted) {
      queryBuilder
        .withDeleted()
        .where("blog_category.deletedAt IS NOT NULL");
    }
    if (search) {
      const searchCondition = "blog_category.name ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }
    if (status) {
      queryBuilder.andWhere("blog_category.status = :status", { status });
    }
    const [blogCategories, total] = await queryBuilder
      .orderBy(
        includeDeleted
          ? "blog_category.deletedAt"
          : "blog_category.createdAt",
        "DESC"
      )
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    return {
      status: "success",
      message: includeDeleted
        ? "Deleted blog categories retrieved successfully"
        : "Blog categories retrieved successfully",
      items: blogCategories.map(toBlogCategoryResource),
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
    const blog = await this.blogCategoriesRepository.findOne({
      where: { id },
      relations: ["user"],
    });
    if (!blog) {
      throw new NotFoundException("Blog category not found");
    }
    return toBlogCategoryResource(blog);
  }

  async update(
    id: string,
    updateBlogCategoryDto: UpdateBlogCategoryDto
  ): Promise<BlogCategory> {
    const blog = await this.blogCategoriesRepository.findOne({
      where: { id },
    });
    if (!blog) {
      throw new NotFoundException("Blog category not found");
    }
    // Check for unique name (exclude current record)
    if (updateBlogCategoryDto.name) {
      const existing = await this.blogCategoriesRepository.findOne({
        where: { name: updateBlogCategoryDto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException("Blog category name must be unique");
      }
    }
    Object.assign(blog, updateBlogCategoryDto);

    const savedBlog = await this.blogCategoriesRepository.save(blog);
    return this.findOne(savedBlog.id);
  }

  async remove(id: string): Promise<void> {
    const blog = await this.blogCategoriesRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException("Blog category not found");
    }
    await this.blogCategoriesRepository.softRemove(blog);
  }

  async restore(id: string): Promise<void> {
    await this.blogCategoriesRepository.restore(id);
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
        await this.blogCategoriesRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.blogCategoriesRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.blogCategoriesRepository.update(
          { id: In(ids) },
          { status: status as EntityStatus }
        );
        break;
    }

    const updated = await this.blogCategoriesRepository.find({
      where: { id: In(ids) },
      relations: ["user"],
    });

    return {
      status: "success",
      message: "Blog categories updated successfully",
      items: updated.map(toBlogCategoryResource),
    };
  }
}
