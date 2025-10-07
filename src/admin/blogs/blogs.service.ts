import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Blog } from "../../common/entities/blog.entity";
import { File } from "../../common/entities/file.entity";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toBlogResource } from "./blog.resource";
import { EntityStatus } from "../../common/enums/status.enum";
import slugify from "slugify";
import { BlogCategory } from "../../common/entities/blog-category.entity";

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>,
    @InjectRepository(File)
    private filesRepository: Repository<File>,
    @InjectRepository(BlogCategory)
    private blogCategoriesRepository: Repository<BlogCategory>
  ) { }

  async create(createBlogDto: CreateBlogDto, userId: string): Promise<Blog> {
    let baseSlug = slugify(createBlogDto.name, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    // Ensure uniqueness
    while (await this.blogsRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const blog = this.blogsRepository.create({
      ...createBlogDto,
      slug,
      user: { id: userId },
    });

    if (
      createBlogDto.categoryIds &&
      createBlogDto.categoryIds.length > 0
    ) {
      const categories = await this.blogCategoriesRepository.findBy({
        id: In(createBlogDto.categoryIds),
      });
      blog.categories = categories;
    }

    // Handle file associations
    if (createBlogDto.fileIds && createBlogDto.fileIds.length > 0) {
      const files = await this.filesRepository.findBy({
        id: In(createBlogDto.fileIds),
      });
      blog.files = files;
    }



    const savedBlog = await this.blogsRepository.save(blog);
    return this.findOne(savedBlog.id);
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findBlogsWithFilters(paginationDto, false);
  }

  async findDeletedBlogs(paginationDto: PaginationDto): Promise<any> {
    return this.findBlogsWithFilters(paginationDto, true);
  }

  private async findBlogsWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.blogsRepository
      .createQueryBuilder("blog")
      .leftJoinAndSelect("blog.files", "files")
      .leftJoinAndSelect("blog.categories", "categories");

    if (includeDeleted) {
      queryBuilder.withDeleted().where("blog.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "blog.name ILIKE :search OR blog.description ILIKE :search OR blog.tagLine ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    if (status) {
      queryBuilder.andWhere("blog.status = :status", { status });
    }

    const [blogs, total] = await queryBuilder
      .orderBy(includeDeleted ? "blog.deletedAt" : "blog.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted blogs retrieved successfully"
        : "Blogs retrieved successfully",
      items: blogs.map(toBlogResource),
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
    const blog = await this.blogsRepository.findOne({
      where: { id },
      relations: ["files", "categories"],
    });
    if (!blog) {
      throw new NotFoundException("Blog not found");
    }
    return toBlogResource(blog);
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.blogsRepository.findOne({
      where: { id },
      relations: ["files", "categories"],
    });

    if (!blog) {
      throw new NotFoundException("Blog not found");
    }

    // Handle category associations
    if (updateBlogDto.categoryIds !== undefined) {
      if (updateBlogDto.categoryIds.length > 0) {
        const categories = await this.blogCategoriesRepository.findBy({
          id: In(updateBlogDto.categoryIds),
        });
        blog.categories = categories;
      } else {
        blog.categories = [];
      }
    }

    // Handle file associations
    if (updateBlogDto.fileIds !== undefined) {
      if (updateBlogDto.fileIds.length > 0) {
        const files = await this.filesRepository.findBy({
          id: In(updateBlogDto.fileIds),
        });
        blog.files = files;
      } else {
        blog.files = [];
      }
    }

    // Remove fileIds and categoryIds from the DTO before assigning to avoid TypeORM issues
    const { fileIds, categoryIds, ...updateData } = updateBlogDto;
    Object.assign(blog, updateData);

    const savedBlog = await this.blogsRepository.save(blog);
    return this.findOne(savedBlog.id);
  }

  async remove(id: string): Promise<void> {
    const blog = await this.findOne(id);
    await this.blogsRepository.softRemove(blog);
  }

  async restore(id: string): Promise<void> {
    await this.blogsRepository.restore(id);
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
        await this.blogsRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.blogsRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.blogsRepository.update({ id: In(ids) }, { status: status as EntityStatus });
        break;
    }

    const updated = await this.blogsRepository.find({
      where: { id: In(ids) },
      relations: ["files"],
    });

    return {
      status: "success",
      message: "Blogs updated successfully",
      items: updated.map(toBlogResource),
    };
  }
}
