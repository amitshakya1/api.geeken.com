import { File } from "../../common/entities/file.entity";
import { s3Config } from "../../admin/files/s3.config";

export function toFileResource(file: File): any {
  // Generate URL based on disk type
  const generateUrl = (fileName: string, disk: string): string => {
    if (disk === "s3") {
      return `https://${s3Config.bucket || "your-bucket"}.s3.${s3Config.region || "us-east-1"}.amazonaws.com/${fileName}`;
    } else {
      const baseUrl = process.env.APP_URL || "http://localhost:3000";
      return `${baseUrl}/${fileName}`;
    }
  };

  const generatedConversions = file.generatedConversions
    ? Object.entries(file.generatedConversions).reduce(
      (acc, [key, fileName]) => {
        acc[key] = generateUrl(fileName as string, file.conversionsDisk);
        return acc;
      },
      {} as Record<string, string>
    )
    : null;

  return {
    id: file.id,
    name: file.name,
    altText: file.altText,
    fileName: file.fileName,
    originalUrl: generateUrl(`uploads/${file.id}/${file.fileName}`, file.disk),
    mimeType: file.mimeType,
    generatedConversions: generatedConversions,
  };
}
