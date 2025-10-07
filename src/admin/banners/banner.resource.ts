import { Banner } from "../../common/entities/banner.entity";
import { toFileResource } from "../files/file.resource";
export function toBannerResource(banner: Banner): any {
  return {
    id: banner.id,
    name: banner.name,
    tagLine: banner.tagLine,
    description: banner.description,
    // user: banner.user, // You may want to transform this further
    mobileImage: toFileResource(banner.mobileImage), // You may want to transform this further
    desktopImage: toFileResource(banner.desktopImage), // You may want to transform this further
    status: banner.status,
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
    deletedAt: banner.deletedAt,
  };
}
