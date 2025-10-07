import { User } from "../../common/entities/user.entity";
import { toFileResource } from "../files/file.resource";

export function toUserResource(user: User): any {
  const roles = user.userRoles
    ? user.userRoles.map((role) => role.role.name)
    : [];
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    image: user.image ? toFileResource(user.image) : null,
    embedMapUrl: user.embedMapUrl,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    lastLoginAt: user.lastLoginAt,
    files: user.files ? user.files.map((file) => toFileResource(file)) : [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: roles,
    permissions: user.userPermissions
      ? user.userPermissions.map((permission) => permission.permission.name)
      : [],
    companies: roles.includes("partner")
      ? user.companies
        ? user.companies.map((company) => ({
          id: company.id,
          name: company.name,
          email: company.email,
          phone: company.phone,
          address: company.address,
          city: company.city,
          state: company.state,
          pincode: company.pincode,
          country: company.country,
          gstName: company.gstName,
          gstNumber: company.gstNumber,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
          addresses: company.addresses
            ? company.addresses.map((address) => ({
              id: address.id,
              type: address.type,
              address: address.address,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              country: address.country,
            }))
            : [],
          bankAccounts: company.bankAccounts
            ? company.bankAccounts.map((bankAccount) => ({
              id: bankAccount.id,
              bankName: bankAccount.bankName,
              accountNumber: bankAccount.accountNumber,
              accountHolderName: bankAccount.accountHolderName,
              ifscCode: bankAccount.ifscCode,
              upiName: bankAccount.upiName,
              upiAddress: bankAccount.upiAddress,
              createdAt: bankAccount.createdAt,
              updatedAt: bankAccount.updatedAt,
            }))
            : [],
          documents: company.documents
            ? company.documents.map((document) => ({
              id: document.id,
              type: document.type,
              idNumber: document.idNumber,
              frontFile: document.frontFile
                ? toFileResource(document.frontFile)
                : null,
              backFile: document.backFile
                ? toFileResource(document.backFile)
                : null,
              createdAt: document.createdAt,
              updatedAt: document.updatedAt,
            }))
            : [],
        }))
        : []
      : [],
    productCommissions: roles.includes("partner")
      ? user.productCommissions
        ? user.productCommissions.map((productCommission) => ({
          id: productCommission.id,
          productId: productCommission.product.id,
          productName: productCommission.product.name,
          percentage: productCommission.percentage,
          createdAt: productCommission.createdAt,
          updatedAt: productCommission.updatedAt,
        }))
        : []
      : [],
    documents:
      roles.includes("partner") || roles.includes("guest")
        ? user.documents
          ? user.documents.map((document) => ({
            id: document.id,
            type: document.type,
            idNumber: document.idNumber,
            frontFile: document.frontFile
              ? toFileResource(document.frontFile)
              : null,
            backFile: document.backFile
              ? toFileResource(document.backFile)
              : null,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
          }))
          : []
        : [],
  };
}
