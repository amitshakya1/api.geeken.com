import { Enquiry } from "../../common/entities/enquiry.entity";
import { toFileResource } from "../files/file.resource";

export const toEnquiryResource = (enquiry: Enquiry) => {
  return {
    id: enquiry.id,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    subject: enquiry.subject,
    message: enquiry.message,
    source: enquiry.source,
    type: enquiry.type,
    files: enquiry.files
      ? enquiry.files.map((file) => toFileResource(file))
      : [],
    leadSource: enquiry.leadSource,
    customFields: enquiry.customFields,
    // user: enquiry.user,
    status: enquiry.status,
    emailSentAt: enquiry.emailSentAt,
    whatsappMessageSentAt: enquiry.whatsappMessageSentAt,
    smsSentAt: enquiry.smsSentAt,
    replies:
      enquiry.replies?.map((reply) => ({
        id: reply.id,
        message: reply.message,
        user: reply.user
          ? {
            id: reply.user.id,
            firstName: reply.user.firstName,
            lastName: reply.user.lastName,
          }
          : null,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        file: reply.file ? toFileResource(reply.file) : null,
      })) ?? [],

    createdAt: enquiry.createdAt,
    updatedAt: enquiry.updatedAt,
  };
};
