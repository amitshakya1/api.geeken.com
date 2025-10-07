import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { File } from "../../common/entities/file.entity";
import { CreateFileDto } from "./dto/create-file.dto";
import { UpdateFileDto } from "./dto/update-file.dto";
import { toFileResource } from "./file.resource";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { PaginationWithFileTypeDto } from "../../common/dto/pagination.dto";

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>
  ) { }

  async create(createFileDto: CreateFileDto): Promise<File> {
    // Save the file entity first to get the ID
    const file = await this.filesRepository.save(
      this.filesRepository.create({
        ...createFileDto,
        user: createFileDto.userId ? { id: createFileDto.userId } : undefined,
      })
    );

    // If local disk, move files into uploads/<fileId>/
    if (createFileDto.disk === "local") {
      const fileId = file.id;
      const uploadRoot =
        process.env.UPLOAD_DIR || join(__dirname, "../../../uploads");
      const fileFolder = join(uploadRoot, fileId);
      await fs.mkdir(fileFolder, { recursive: true });

      // Move original file
      const oldOriginalPath = join(uploadRoot, createFileDto.fileName);
      const newOriginalPath = join(fileFolder, createFileDto.fileName);
      try {
        await fs.rename(oldOriginalPath, newOriginalPath);
      } catch (e) {
        /* ignore if already moved or not found */
      }

      // Move conversion files and update paths
      const updatedConversions: Record<string, string> = {};
      if (createFileDto.generatedConversions) {
        for (const [key, relPath] of Object.entries(
          createFileDto.generatedConversions
        )) {
          const relPathStr = String(relPath);
          const oldPath = join(uploadRoot, relPathStr.replace("uploads/", ""));
          const newPath = join(fileFolder, relPathStr.split("/").pop()!);
          try {
            await fs.rename(oldPath, newPath);
          } catch (e) {
            /* ignore if already moved or not found */
          }
          updatedConversions[key] =
            `uploads/${fileId}/${relPathStr.split("/").pop()}`;
        }
      }
      file.generatedConversions = updatedConversions;
      await this.filesRepository.save(file);
    }
    return file;
  }

  async findAll(paginationDto: PaginationWithFileTypeDto): Promise<any> {
    return this.findFilesWithFilters(paginationDto, false);
  }

  async findDeletedFiles(paginationDto: PaginationWithFileTypeDto): Promise<any> {
    return this.findFilesWithFilters(paginationDto, true);
  }

  private async findFilesWithFilters(
    paginationDto: PaginationWithFileTypeDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status, mimeType } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.filesRepository.createQueryBuilder("file");

    if (includeDeleted) {
      queryBuilder.withDeleted().where("file.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "file.name ILIKE :search OR file.altText ILIKE :search OR file.fileName ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    if (status) {
      queryBuilder.andWhere("file.status = :status", { status });
    }

    if (mimeType) {
      queryBuilder.andWhere("file.mimeType = :mimeType", { mimeType });
    }

    const [files, total] = await queryBuilder
      .orderBy(includeDeleted ? "file.deletedAt" : "file.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted files retrieved successfully"
        : "Files retrieved successfully",
      items: files.map(toFileResource),
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
    const file = await this.filesRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException("File not found");
    }
    return toFileResource(file);
  }

  async update(id: string, updateFileDto: UpdateFileDto): Promise<File> {
    const file = await this.filesRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException("File not found");
    }
    Object.assign(file, updateFileDto);
    return this.filesRepository.save(file);
  }

  async remove(id: string): Promise<void> {
    const file = await this.filesRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException("File not found");
    }
    await this.filesRepository.softRemove(file);
  }

  async restore(id: string): Promise<void> {
    await this.filesRepository.restore(id);
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
        await this.filesRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.filesRepository.softDelete({ id: In(ids) });
        break;
      default:

        break;
    }

    const updated = await this.filesRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    });

    return {
      status: "success",
      message: "Files updated successfully",
      items: updated.map(toFileResource),
    };
  }
}
