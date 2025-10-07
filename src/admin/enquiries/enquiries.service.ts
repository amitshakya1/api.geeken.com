import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Enquiry } from "../../common/entities/enquiry.entity";
import { CreateEnquiryDto } from "./dto/create-enquiry.dto";
import { UpdateEnquiryDto } from "./dto/update-enquiry.dto";
import { File } from "../../common/entities/file.entity";
import { PaginationWithTypeDto } from "../../common/dto/pagination.dto";
import { toEnquiryResource } from "./enquiry.resource";
import { EnquiryReply } from "../../common/entities/enquiry-reply.entity";
import { EnquiryStatus } from "../../common/enums/enquiry-status.enum";

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectRepository(Enquiry)
    private readonly enquiryRepository: Repository<Enquiry>,
    @InjectRepository(EnquiryReply)
    private readonly enquiryReplyRepository: Repository<EnquiryReply>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>
  ) { }

  async create(createEnquiryDto: CreateEnquiryDto, userId?: string) {
    const { fileIds, replies, ...rest } = createEnquiryDto;

    // Load enquiry-level files
    let files: File[] = [];
    if (fileIds?.length) {
      files = await this.fileRepository.find({
        where: {
          id: In(fileIds),
        },
      });
    }

    // Map replies with proper File relation
    let mappedReplies: EnquiryReply[] = [];
    if (replies?.length) {
      mappedReplies = await Promise.all(
        replies.map(async (reply) => {
          let file: File | undefined;

          if (reply.file && typeof reply.file === "string") {
            file = await this.fileRepository.findOne({
              where: { id: reply.file },
            });
          }

          return this.enquiryReplyRepository.create({
            ...reply,
            file,
            user: { id: userId },
          });
        })
      );
    }

    // Create the enquiry with cascade replies and files
    const enquiry = this.enquiryRepository.create({
      ...rest,
      replies: mappedReplies,
      files: files, // Include files in the initial creation
      user: { id: userId },
    });

    const savedEnquiry = await this.enquiryRepository.save(enquiry);

    return this.findOne(savedEnquiry.id);
  }

  async findAll(paginationDto: PaginationWithTypeDto) {
    return this.findEnquiriesWithFilters(paginationDto, false);
  }

  async findDeletedEnquiries(paginationDto: PaginationWithTypeDto) {
    return this.findEnquiriesWithFilters(paginationDto, true);
  }

  private async findEnquiriesWithFilters(
    paginationDto: PaginationWithTypeDto,
    includeDeleted = false
  ) {
    const { page = 1, limit = 10, search, status, type } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.enquiryRepository
      .createQueryBuilder("enquiry")
      .leftJoinAndSelect("enquiry.user", "user")
      .leftJoinAndSelect("enquiry.files", "files")
      .leftJoinAndSelect("enquiry.replies", "replies")
      .leftJoinAndSelect("replies.user", "replyUser")
      .leftJoinAndSelect("replies.file", "replyFile");

    if (includeDeleted) {
      queryBuilder.withDeleted().where("enquiry.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "enquiry.name ILIKE :search OR enquiry.email ILIKE :search OR enquiry.subject ILIKE :search OR enquiry.message ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    if (status) {
      queryBuilder.andWhere("enquiry.status = :status", { status });
    }

    if (type) {
      queryBuilder.andWhere("enquiry.type = :type", { type });
    }

    const [enquiries, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy(
        includeDeleted ? "enquiry.deletedAt" : "enquiry.createdAt",
        "DESC"
      )
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted enquiries retrieved successfully"
        : "Enquiries retrieved successfully",
      items: enquiries.map(toEnquiryResource),
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

  async findOne(id: string) {
    const enquiry = await this.enquiryRepository.findOne({
      where: { id },
      relations: ["user", "files", "replies", "replies.file", "replies.user"],
    });

    return toEnquiryResource(enquiry);
  }

  async update(
    id: string,
    updateEnquiryDto: UpdateEnquiryDto,
    userId?: string
  ) {
    const enquiry = await this.enquiryRepository.findOne({
      where: { id },
      relations: ["files", "replies", "replies.file"], // preload relations
    });

    if (!enquiry) {
      throw new Error("Enquiry not found");
    }

    const { fileIds, replies, ...rest } = updateEnquiryDto;

    // update root enquiry fields
    Object.assign(enquiry, rest);

    // update files
    if (fileIds !== undefined) {
      if (fileIds.length > 0) {
        const files = await this.fileRepository.find({
          where: {
            id: In(fileIds),
          },
        });
        enquiry.files = files;
      } else {
        enquiry.files = [];
      }
    }

    if (replies) {
      const updatedReplies = [];

      for (const reply of replies) {
        let replyEntity = reply.id
          ? enquiry.replies.find((r) => r.id === reply.id)
          : undefined;

        if (replyEntity) {
          // 🔹 update existing reply
          replyEntity.message = reply.message ?? replyEntity.message;

          // update user if provided
          if (reply.userId) {
            replyEntity.user = { id: reply.userId } as any;
          }
        } else {
          // 🔹 create new reply
          replyEntity = this.enquiryReplyRepository.create({
            message: reply.message,
            enquiry: { id: enquiry.id } as any, // relation stub
            user: userId ? ({ id: userId } as any) : undefined,
          });
        }

        // 🔹 handle file relation
        if (reply.file && typeof reply.file === "string") {
          const fileEntity = await this.fileRepository.findOne({
            where: { id: reply.file },
          });
          replyEntity.file = fileEntity ?? undefined;
        }

        updatedReplies.push(replyEntity);
      }

      enquiry.replies = updatedReplies;
    }

    const savedEnquiry = await this.enquiryRepository.save(enquiry);
    return this.findOne(savedEnquiry.id);
  }

  async remove(id: string) {
    return this.enquiryRepository.softDelete(id);
  }

  async restore(id: string) {
    return this.enquiryRepository.restore(id);
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
        await this.enquiryRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.enquiryRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.enquiryRepository.update({ id: In(ids) }, { status: status as EnquiryStatus });
        break;
    }

    const updated = await this.enquiryRepository.find({
      where: { id: In(ids) },
      relations: ["user", "files", "replies", "replies.file", "replies.user"],
    });

    return {
      status: "success",
      message: "Enquiries updated successfully",
      items: updated.map(toEnquiryResource),
    };
  }
}
