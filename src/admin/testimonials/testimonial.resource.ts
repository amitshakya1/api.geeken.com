import { Testimonial } from "../../common/entities/testimonial.entity";
import { toFileResource } from "../files/file.resource";

export const toTestimonialResource = (testimonial: Testimonial) => {
  return {
    id: testimonial.id,
    authorName: testimonial.authorName,
    authorDesignation: testimonial.authorDesignation,
    company: testimonial.company,
    message: testimonial.message,
    rating: testimonial.rating,
    image: testimonial.image ? toFileResource(testimonial.image) : null,
    video: testimonial.video ? toFileResource(testimonial.video) : null,
    source: testimonial.source,
    status: testimonial.status,
    createdAt: testimonial.createdAt,
    updatedAt: testimonial.updatedAt,
    deletedAt: testimonial.deletedAt,
  };
};
