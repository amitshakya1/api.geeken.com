import { extname, join } from "path";
import { promises as fs } from "fs";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import type { Multer } from "multer";
import { s3Config } from "./s3.config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const IMAGE_CONVERSIONS = [
  { name: "icon", width: 150 },
  { name: "thumb", width: 375 },
  { name: "small", width: 550 },
  { name: "medium", width: 750 },
  { name: "large", width: 1100 },
  { name: "xlarge", width: 1500 },
];

const s3 = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});

async function uploadToS3(buffer: Buffer, key: string, mimeType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
  return key;
}

export async function handleFileUpload(
  file: Multer.File,
  uploadDir: string,
  disk: "local" | "s3" = "local",
  fileId?: string
): Promise<any> {
  const isImage = file.mimetype.startsWith("image/");
  const originalExt = extname(file.originalname);
  const baseName = uuidv4();
  const fileName = `${baseName}${originalExt}`;
  let generatedConversions = {};
  let fileUrlOrPath = "";

  if (disk === "s3") {
    // Upload original file to S3
    const originalKey = fileId
      ? `uploads/${fileId}/${fileName}`
      : `uploads/${fileName}`;
    await uploadToS3(file.buffer, originalKey, file.mimetype);
    fileUrlOrPath = originalKey;
    if (isImage) {
      const metadata = await sharp(file.buffer).metadata();
      const originalWidth = metadata.width || 0;
      for (const conv of IMAGE_CONVERSIONS) {
        if (conv.width < originalWidth) {
          const convName = `${baseName}_${conv.name}.webp`;
          const convKey = fileId
            ? `uploads/${fileId}/${convName}`
            : `uploads/${convName}`;
          const convBuffer = await sharp(file.buffer)
            .resize({ width: conv.width })
            .webp()
            .toBuffer();
          await uploadToS3(convBuffer, convKey, "image/webp");
          generatedConversions[conv.name] = convKey;
        }
      }
    }
  } else {
    // Local storage
    const fileDirectory = fileId ? join(uploadDir, fileId) : uploadDir;
    const filePath = join(fileDirectory, fileName);
    await fs.mkdir(fileDirectory, { recursive: true });
    await fs.writeFile(filePath, file.buffer);
    fileUrlOrPath = fileId
      ? `uploads/${fileId}/${fileName}`
      : `uploads/${fileName}`;
    if (isImage) {
      const metadata = await sharp(file.buffer).metadata();
      const originalWidth = metadata.width || 0;
      for (const conv of IMAGE_CONVERSIONS) {
        if (conv.width < originalWidth) {
          const convName = `${baseName}_${conv.name}.webp`;
          const convPath = join(fileDirectory, convName);
          await sharp(file.buffer)
            .resize({ width: conv.width })
            .webp()
            .toFile(convPath);
          generatedConversions[conv.name] = fileId
            ? `uploads/${fileId}/${convName}`
            : `uploads/${convName}`;
        }
      }
    }
  }
  return {
    fileName,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    generatedConversions,
    isImage,
    fileUrlOrPath,
    disk,
  };
}
