import { Banner } from "../../common/entities/banner.entity";
import { toFileResource } from "../files/file.resource";
export function toBannerResource(banner: Banner): any {
  return {
    id: banner.id,
    name: banner.name,
    tagLine: banner.tagLine,
    description: banner.description,
    mobileImage: toFileResource(banner.mobileImage),
    desktopImage: toFileResource(banner.desktopImage),
  };
}
