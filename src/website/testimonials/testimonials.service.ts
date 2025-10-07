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


  async findAll(paginationDto: PaginationDto) {
    return this.findTestimonialsWithFilters(paginationDto, false);
  }

  private async findTestimonialsWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ) {
    const { page = 1, limit = 10, search } = paginationDto;
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

    queryBuilder.andWhere("testimonial.status = :status", { status: EntityStatus.ACTIVE });

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

}
