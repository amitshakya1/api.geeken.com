import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Testimonial } from "../../common/entities/testimonial.entity";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toTestimonialResource } from "./testimonial.resource";
import { EntityStatus } from "../../common/enums/status.enum";

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>
  ) { }

  async create(createTestimonialDto: CreateTestimonialDto, userId?: string) {
    const { imageId, videoId, ...rest } = createTestimonialDto;
    const testimonial = this.testimonialRepository.create({
      ...rest,
      user: { id: userId },
      image: imageId ? { id: imageId } : undefined,
      video: videoId ? { id: videoId } : undefined,
    });
    const savedTestimonial = await this.testimonialRepository.save(testimonial);
    return this.findOne(savedTestimonial.id);
  }

  async findAll(paginationDto: PaginationDto) {
    return this.findTestimonialsWithFilters(paginationDto, false);
  }

  async findDeletedTestimonials(paginationDto: PaginationDto) {
    return this.findTestimonialsWithFilters(paginationDto, true);
  }

  private async findTestimonialsWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ) {
    const { page = 1, limit = 10, search, status } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.testimonialRepository
      .createQueryBuilder("testimonial")
      .leftJoinAndSelect("testimonial.user", "user")
      .leftJoinAndSelect("testimonial.image", "image")
      .leftJoinAndSelect("testimonial.video", "video");

    if (includeDeleted) {
      queryBuilder.withDeleted().where("testimonial.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "testimonial.authorName ILIKE :search OR testimonial.authorDesignation ILIKE :search OR testimonial.company ILIKE :search OR testimonial.message ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    if (status) {
      queryBuilder.andWhere("testimonial.status = :status", { status });
    }

    const [testimonials, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy(
        includeDeleted ? "testimonial.deletedAt" : "testimonial.createdAt",
        "DESC"
      )
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted testimonials retrieved successfully"
        : "Testimonials retrieved successfully",
      items: testimonials.map(toTestimonialResource),
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
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
      relations: ["user", "image", "video"],
    });

    if (!testimonial) {
      throw new NotFoundException("Testimonial not found");
    }
    return toTestimonialResource(testimonial);
  }

  async update(id: string, updateTestimonialDto: UpdateTestimonialDto) {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
    });
    if (!testimonial) {
      throw new Error("Testimonial not found");
    }

    const { imageId, videoId, ...rest } = updateTestimonialDto;

    Object.assign(testimonial, rest);

    if (imageId !== undefined) {
      testimonial.image = imageId ? ({ id: imageId } as any) : null;
    }

    if (videoId !== undefined) {
      testimonial.video = videoId ? ({ id: videoId } as any) : null;
    }

    const savedTestimonial = await this.testimonialRepository.save(testimonial);
    return this.findOne(savedTestimonial.id);
  }

  async remove(id: string) {
    return this.testimonialRepository.softDelete(id);
  }

  async restore(id: string) {
    return this.testimonialRepository.restore(id);
  }

  async updateStatusByIds(ids: string[], status: string) {
    const testimonials = await this.testimonialRepository.findByIds(ids);

    if (testimonials.length === 0) {
      throw new NotFoundException('No testimonials found with the provided IDs');
    }

    if (status === 'delete') {
      await this.testimonialRepository.softDelete(ids);
      return {
        status: 'success',
        message: 'Testimonials deleted successfully',
        count: testimonials.length
      };
    }

    if (status === 'restore') {
      await this.testimonialRepository.restore(ids);
      return {
        status: 'success',
        message: 'Testimonials restored successfully',
        count: testimonials.length
      };
    }

    // Update status for active, archived, or draft
    await this.testimonialRepository.update(ids, { status: status as EntityStatus });

    return {
      status: 'success',
      message: 'Testimonials updated successfully',
      count: testimonials.length
    };
  }
}
