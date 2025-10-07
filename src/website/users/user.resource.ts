import { User } from "../../common/entities/user.entity";
import { toFileResource } from "../../admin/files/file.resource";

export function toUserResource(user: User): any {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    image: user.image ? toFileResource(user.image) : null,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
