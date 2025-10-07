import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UploadedFiles,
  Put,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { FilesService } from "./files.service";
import { CreateFileDto } from "./dto/create-file.dto";
import { UpdateFileDto } from "./dto/update-file.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { handleFileUpload } from "./file-upload.manager";
import { toFileResource } from "./file.resource";
import { join } from "path";
import type { Multer } from "multer";
import { config as dotenvConfig } from "dotenv";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ThrottleUpload } from "../../common/decorators/throttle.decorator";
import { UpdateFileStatusDto } from "./dto/update-file-status.dto";
dotenvConfig();

@ApiTags("files")
@Controller("admin/files")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  private async processAndSaveFile(
    file: Multer.File,
    body: any,
    user: any,
    disk: string,
    uploadDir: string
  ) {
    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".gif",
      ".jpg",
      ".png",
      ".jpeg",
      ".webp",
      ".avif",
      ".mp4",
      ".mp3",
      ".wav",
      ".ogg",
      ".svg",
    ];
    const fileExt = (file.originalname.match(/\.[^.]+$/) || [
      "",
    ])[0].toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      throw new BadRequestException(
        `File type ${fileExt} is not allowed. Allowed types: ${allowedExtensions.join(", ")}`
      );
    }

    // Create file record first to get the ID
    const createFileDto: CreateFileDto = {
      name: body.name || file.originalname,
      altText: body.altText || body.name || file.originalname,
      fileName: "", // Will be set after upload
      mimeType: file.mimetype,
      disk: disk,
      conversionsDisk: disk,
      size: file.size,
      generatedConversions: {},
      userId: user.id.toString(),
    };
    const created = await this.filesService.create(createFileDto);
    // Upload file with the file ID
    const uploadResult = await handleFileUpload(
      file,
      uploadDir,
      disk as "local" | "s3",
      created.id
    );

    // Update the file record with the actual file name and conversions
    const updateFileDto = {
      fileName: uploadResult.fileName,
      generatedConversions: uploadResult.generatedConversions,
    };
    const updated = await this.filesService.update(created.id, updateFileDto);
    return toFileResource(updated);
  }

  // @Post()
  // @ThrottleUpload()
  // @ApiOperation({ summary: 'Upload a file (.pdf, .doc, .gif, .jpg, .png, .jpeg, .webp, .avif, .mp4, .mp3, .wav, .ogg, .svg)' })
  // @ApiResponse({ status: 201, description: 'File uploaded and processed successfully' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //     schema: {
  //         type: 'object',
  //         properties: {
  //             file: {
  //                 type: 'string',
  //                 format: 'binary',
  //                 description: 'The file to upload',
  //             },
  //             altText: { type: 'string', description: 'Alt text for the file (optional)' },
  //             name: { type: 'string', description: 'File name (optional)' },
  //             disk: { type: 'string', enum: ['local', 's3'], description: 'Storage disk' },
  //         },
  //         required: ['file'],
  //     },
  // })
  // @Permissions('create_file')
  // @UseInterceptors(FileInterceptor('file'))
  // async create(@UploadedFile() file: Multer.File, @Body() body: any, @CurrentUser() user) {
  //     const uploadDir = process.env.UPLOAD_DIR || join(__dirname, '../../../uploads');
  //     const disk = body.disk === 's3' ? 's3' : 'local';
  //     return this.processAndSaveFile(file, body, user, disk, uploadDir);
  // }

  @Post()
  @ThrottleUpload()
  @ApiOperation({
    summary:
      "Upload multiple files (.pdf, .doc, .gif, .jpg, .png, .jpeg, .webp, .avif, .mp4, .mp3, .wav, .ogg, .svg)",
  })
  @ApiResponse({
    status: 201,
    description: "Files uploaded and processed successfully",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: { type: "string", format: "binary" },
          description: "Files to upload",
        },
        altText: {
          type: "string",
          description: "Alt text for the files (optional)",
        },
        name: { type: "string", description: "File name (optional)" },
        disk: {
          type: "string",
          enum: ["local", "s3"],
          description: "Storage disk",
        },
      },
      required: ["files"],
    },
  })
  @Permissions("create_file")
  @UseInterceptors(FilesInterceptor("files"))
  async uploadMultiple(
    @UploadedFiles() files: Array<Multer.File>,
    @Body() body: any,
    @CurrentUser() user
  ) {
    const uploadDir =
      process.env.UPLOAD_DIR || join(__dirname, "../../../uploads");
    const disk = body.disk === "s3" ? "s3" : "local";
    const results = [];
    for (const file of files) {
      try {
        results.push(
          await this.processAndSaveFile(file, body, user, disk, uploadDir)
        );
      } catch (e) {
        console.log(e);
        // Optionally skip or collect errors for invalid files
        continue;
      }
    }
    return results;
  }

  @Get()
  @ApiOperation({ summary: "Get all files with pagination and search" })
  @ApiResponse({ status: 200, description: "Files retrieved successfully" })
  @Permissions("read_file")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.filesService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted files with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted files retrieved successfully",
  })
  @Permissions("read_file")
  findDeletedFiles(@Query() paginationDto: PaginationDto) {
    return this.filesService.findDeletedFiles(paginationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get file by ID" })
  @ApiResponse({ status: 200, description: "File retrieved successfully" })
  @Permissions("read_file")
  findOne(@Param("id") id: string) {
    return this.filesService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update file by ID" })
  @ApiResponse({ status: 200, description: "File updated successfully" })
  @Permissions("update_file")
  update(@Param("id") id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(id, updateFileDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete file by ID" })
  @ApiResponse({ status: 200, description: "File deleted successfully" })
  @Permissions("delete_file")
  remove(@Param("id") id: string) {
    return this.filesService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted file by ID" })
  @ApiResponse({ status: 200, description: "File restored successfully" })
  @Permissions("update_file")
  restore(@Param("id") id: string) {
    return this.filesService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status of files by IDs" })
  @ApiResponse({ status: 200, description: "Files updated successfully" })
  @Permissions("update_file")
  async updateStatusByIds(@Body() body: UpdateFileStatusDto) {
    const { ids, status } = body;
    return this.filesService.updateStatusByIds(ids, status);
  }
}
