import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, In } from "typeorm";

import { User } from "../../common/entities/user.entity";
import { UserRole } from "../../common/entities/user-role.entity";
import { UserPermission } from "../../common/entities/user-permission.entity";
import { UserCreationAudit } from "../../common/entities/user-creation-audit.entity";
import { Role } from "../../common/entities/role.entity";
import { Permission } from "../../common/entities/permission.entity";
import { File } from "../../common/entities/file.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PaginationWithRoleDto } from "../../common/dto/pagination.dto";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import { toUserResource } from "./user.resource";
import { UserCompany } from "../../common/entities/user-company.entity";
import { UserDocument } from "../../common/entities/user-document.entity";
import { CompanyBankAccount } from "../../common/entities/company-bank-account.entity";
import { CompanyAddress } from "../../common/entities/company-address.entity";
import { CompanyDocument } from "../../common/entities/company-document.entity";
import { ProductCommission } from "../../common/entities/product-commission.entity";
import { EntityStatus } from "../../common/enums/status.enum";

@Injectable()
export class UsersService {
  permissionService: any;
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(UserPermission)
    private userPermissionsRepository: Repository<UserPermission>,
    @InjectRepository(UserCreationAudit)
    private userCreationAuditRepository: Repository<UserCreationAudit>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(File)
    private filesRepository: Repository<File>,
    @InjectRepository(UserDocument)
    private userDocumentRepository: Repository<UserDocument>,
    @InjectRepository(UserCompany)
    private userCompanyRepository: Repository<UserCompany>,
    @InjectRepository(CompanyBankAccount)
    private companyBankAccountRepository: Repository<CompanyBankAccount>,
    @InjectRepository(CompanyAddress)
    private companyAddressRepository: Repository<CompanyAddress>,
    @InjectRepository(ProductCommission)
    private productCommissionRepository: Repository<ProductCommission>,
    @InjectRepository(CompanyDocument)
    private companyDocumentRepository: Repository<CompanyDocument>
  ) { }

  async create(
    createUserDto: CreateUserDto,
    createdByAdminId?: string
  ): Promise<User> {
    // Log the CreateUserDto parameters
    try {
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, 'createUserDto.log');
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        createdByAdminId,
        createUserDto
      };

      fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + '\n' + '---\n');
    } catch (error) {
      console.error('Error logging CreateUserDto:', error);
    }

    const queryBuilderEmail = this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.userRoles", "userRoles")
      .leftJoinAndSelect("userRoles.role", "role");

    if (createUserDto.email) {
      queryBuilderEmail.andWhere("user.email = :email", { email: createUserDto.email });
    }
    if (createUserDto.role) {
      queryBuilderEmail.andWhere("role.name = :role", { role: createUserDto.role });
    }
    // Check for unique email
    const existingUser = await queryBuilderEmail.getOne();
    if (existingUser) {
      throw new ConflictException(`User with this ${createUserDto.role ? 'role and' : ''} email already exists`);
    }

    const queryBuilderPhone = this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.userRoles", "userRoles")
      .leftJoinAndSelect("userRoles.role", "role");

    if (createUserDto.phone) {
      queryBuilderPhone.andWhere("user.phone = :phone", { phone: createUserDto.phone });
    }
    if (createUserDto.role) {
      queryBuilderPhone.andWhere("role.name = :role", { role: createUserDto.role });
    }
    // Check for unique email
    const existingPhone = await queryBuilderPhone.getOne();
    if (existingPhone) {
      throw new ConflictException(`User with this ${createUserDto.role ? 'role and' : ''} phone already exists`);
    }

    const plainPassword = createUserDto.password ?? "sajdk^6GJG#$kjh";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone: createUserDto.phone,
      status: createUserDto.status,
      image: createUserDto.imageId ? { id: createUserDto.imageId } : undefined,
    });

    // Handle file associations
    if (createUserDto.fileIds && createUserDto.fileIds.length > 0) {
      const files = await this.filesRepository.findBy({
        id: In(createUserDto.fileIds),
      });
      user.files = files;
    }

    const savedUser = await this.usersRepository.save(user);

    // Handle role assignments
    if (createUserDto.role) {
      await this.assignRole(savedUser.id, createUserDto.role);
    }

    if (createUserDto.permissions && createUserDto.permissions.length > 0) {
      for (const permissionName of createUserDto.permissions) {
        try {
          await this.assignPermission(savedUser.id, permissionName);
        } catch (error) {
          // Log the error but don't fail the entire creation
          console.error(
            `Failed to assign permission ${permissionName} to user ${savedUser.email}:`,
            error.message
          );
        }
      }
    }
    // Log the successful creation
    if (createdByAdminId) {
      await this.createUserCreationAudit(savedUser.id, createdByAdminId);
    }

    // Handle companies and nested entities
    if (createUserDto.companies && createUserDto.companies.length > 0) {
      for (const companyDto of createUserDto.companies) {
        // Destructure only primitive fields for company
        const {
          name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          country,
          gstName,
          gstNumber,
        } = companyDto;
        const company = this.userCompanyRepository.create({
          name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          country,
          gstName,
          gstNumber,
          user: { id: savedUser.id },
        });
        const savedCompany = await this.userCompanyRepository.save(company);

        // Addresses
        if (companyDto.addresses && companyDto.addresses.length > 0) {
          for (const addr of companyDto.addresses) {
            const address = this.companyAddressRepository.create({
              ...addr,
              company: savedCompany,
            });
            await this.companyAddressRepository.save(address);
          }
        }
        // Bank Accounts
        if (companyDto.bankAccounts && companyDto.bankAccounts.length > 0) {
          for (const bank of companyDto.bankAccounts) {
            const bankAccount = this.companyBankAccountRepository.create({
              ...bank,
              company: savedCompany,
            });
            await this.companyBankAccountRepository.save(bankAccount);
          }
        }
        // Company Documents
        if (companyDto.documents && companyDto.documents.length > 0) {
          for (const doc of companyDto.documents) {
            const frontFile = doc.frontFileId
              ? await this.filesRepository.findOneBy({
                id: doc.frontFileId,
              })
              : null;
            const backFile = doc.backFileId
              ? await this.filesRepository.findOneBy({
                id: doc.backFileId,
              })
              : null;
            const companyDocument = this.companyDocumentRepository.create({
              ...doc,
              frontFile,
              backFile,
              company: savedCompany,
            });
            await this.companyDocumentRepository.save(companyDocument);
          }
        }
      }
    }

    // User Documents
    if (createUserDto.documents && createUserDto.documents.length > 0) {
      for (const documentDto of createUserDto.documents) {
        const frontFile = documentDto.frontFileId
          ? await this.filesRepository.findOneBy({
            id: documentDto.frontFileId,
          })
          : null;
        const backFile = documentDto.backFileId
          ? await this.filesRepository.findOneBy({ id: documentDto.backFileId })
          : null;
        const document = this.userDocumentRepository.create({
          ...documentDto,
          frontFile,
          backFile,
          user: { id: savedUser.id },
        });
        await this.userDocumentRepository.save(document);
      }
    }

    return this.findItem(savedUser.id);
  }

  async findAll(paginationDto: PaginationWithRoleDto): Promise<any> {
    return this.findUsersWithFilters(paginationDto, false);
  }

  async findDeletedUsers(paginationDto: PaginationWithRoleDto): Promise<any> {
    return this.findUsersWithFilters(paginationDto, true);
  }

  private async findUsersWithFilters(
    paginationDto: PaginationWithRoleDto,
    includeDeleted: boolean = false
  ): Promise<any> {
    const { page, limit, search, role, status } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.image", "image")
      .leftJoinAndSelect("user.files", "files")
      .leftJoinAndSelect("user.userRoles", "userRoles")
      .leftJoinAndSelect("userRoles.role", "role");

    // Handle deleted users
    if (includeDeleted) {
      queryBuilder.withDeleted().where("user.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    if (role) {
      queryBuilder.andWhere("role.name = :role", { role });
    }

    if (status) {
      queryBuilder.andWhere("user.status = :status", { status });
    }

    const [users, total] = await queryBuilder
      .orderBy(includeDeleted ? "user.deletedAt" : "user.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted users retrieved successfully"
        : "Users retrieved successfully",
      items: users.map(toUserResource),
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
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: [
        "userRoles",
        "userRoles.role",
        "userPermissions",
        "productCommissions",
        "productCommissions.product",
        "userPermissions.permission",
        "files",
        "image",
      ],
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findItem(id: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: [
        "userRoles",
        "userRoles.role",
        "userPermissions",
        "userPermissions.permission",
        "files",
        "image",
        "companies",
        "companies.addresses",
        "companies.bankAccounts",
        "companies.documents",
        "companies.documents.frontFile",
        "companies.documents.backFile",
        "documents",
        "documents.frontFile",
        "documents.backFile",
        "productCommissions",
        "productCommissions.product",
      ],
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return toUserResource(user);
  }

  async findByEmail(email: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: [
        "userRoles",
        "userRoles.role",
        "userPermissions",
        "userPermissions.permission",
        "files",
      ],
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findByPhone(phone: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { phone },
      relations: [
        "userRoles",
        "userRoles.role",
        "userPermissions",
        "userPermissions.permission",
        "files",
      ],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async findByResetToken(resetToken: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { passwordResetToken: resetToken },
      relations: [
        "userRoles",
        "userRoles.role",
        "userPermissions",
        "userPermissions.permission",
        "files",
      ],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["files", "companies", "documents"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    try {
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, 'updateUserDto.log');
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        updateUserDto
      };

      fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + '\n' + '---\n');
    } catch (error) {
      console.error('Error logging updateUserDto:', error);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException("User with this email already exists");
      }
    }

    // Handle file associations
    if (updateUserDto.fileIds !== undefined) {
      if (updateUserDto.fileIds.length > 0) {
        const files = await this.filesRepository.findBy({
          id: In(updateUserDto.fileIds),
        });
        user.files = files;
      } else {
        user.files = [];
      }
    }

    // Replace companies (with cascade/orphanRemoval in entity)
    if (updateUserDto.companies !== undefined) {
      user.companies = await Promise.all(
        updateUserDto.companies.map(async (companyDto) => {
          let company: UserCompany;

          if (companyDto.id) {
            // Update existing
            company = await this.userCompanyRepository.findOne({
              where: { id: companyDto.id },
              relations: ["addresses", "bankAccounts", "documents"],
            });

            if (!company) {
              throw new NotFoundException(`Company ${companyDto.id} not found`);
            }

            Object.assign(company, companyDto);

            // Handle nested addresses
            if (companyDto.addresses !== undefined) {
              company.addresses = await Promise.all(
                companyDto.addresses.map(async (addr) => {
                  if (addr.id) {
                    const existing = company.addresses.find(
                      (a) => a.id === addr.id
                    );
                    if (!existing) {
                      throw new NotFoundException(`Address ${addr.id} not found`);
                    }
                    const address = this.companyAddressRepository.create({
                      ...existing,
                      ...addr,
                      company,
                    });
                    return await this.companyAddressRepository.save(address);
                  } else {
                    const address = this.companyAddressRepository.create({
                      ...addr,
                      company,
                    });
                    return await this.companyAddressRepository.save(address);
                  }
                })
              );
            }

            // Same for bankAccounts
            if (companyDto.bankAccounts !== undefined) {
              company.bankAccounts = await Promise.all(
                companyDto.bankAccounts.map(async (bank) => {
                  if (bank.id) {
                    const existing = company.bankAccounts.find(
                      (b) => b.id === bank.id
                    );
                    if (!existing) {
                      throw new NotFoundException(
                        `Bank account ${bank.id} not found`
                      );
                    }
                    const bankAccount = this.companyBankAccountRepository.create({
                      ...existing,
                      ...bank,
                      company,
                    });
                    return await this.companyBankAccountRepository.save(bankAccount);
                  } else {
                    const bankAccount = this.companyBankAccountRepository.create({
                      ...bank,
                      company,
                    });
                    return await this.companyBankAccountRepository.save(bankAccount);
                  }
                })
              );
            }

            // Same for documents
            if (companyDto.documents !== undefined) {
              company.documents = await Promise.all(
                companyDto.documents.map(async (doc) => {
                  let frontFile = null;
                  let backFile = null;

                  if (doc.frontFileId) {
                    frontFile = await this.filesRepository.findOneBy({
                      id: doc.frontFileId,
                    });
                  }
                  if (doc.backFileId) {
                    backFile = await this.filesRepository.findOneBy({
                      id: doc.backFileId,
                    });
                  }

                  if (doc.id) {
                    const existing = company.documents.find(
                      (d) => d.id === doc.id
                    );
                    if (!existing) {
                      throw new NotFoundException(
                        `Document ${doc.id} not found`
                      );
                    }
                    const companyDocument = this.companyDocumentRepository.create({
                      ...existing,
                      ...doc,
                      company,
                      frontFile,
                      backFile,
                    });
                    return await this.companyDocumentRepository.save(companyDocument);
                  } else {
                    const companyDocument = this.companyDocumentRepository.create({
                      ...doc,
                      company,
                      frontFile,
                      backFile,
                    });
                    return await this.companyDocumentRepository.save(companyDocument);
                  }
                })
              );
            }
          } else {
            // New company
            company = this.userCompanyRepository.create({
              ...companyDto,
              user,
            });
          }

          return company;
        })
      );
    }

    // Replace product commissions
    if (updateUserDto.productCommissions !== undefined) {
      user.productCommissions = await Promise.all(
        updateUserDto.productCommissions.map(async (commissionDto) => {
          let commission;
          if (commissionDto.id) {
            commission = await this.productCommissionRepository.findOne({
              where: { id: commissionDto.id },
            });
            if (!commission)
              throw new NotFoundException(
                `Commission ${commissionDto.id} not found`
              );
            Object.assign(commission, commissionDto);
            return await this.productCommissionRepository.save(commission);
          } else {
            commission = this.productCommissionRepository.create({
              ...commissionDto,
              partner: user,
            });
            return await this.productCommissionRepository.save(commission);
          }
        })
      );
    }

    // Replace user documents
    if (updateUserDto.documents !== undefined) {
      user.documents = await Promise.all(
        updateUserDto.documents.map(async (docDto) => {
          const frontFile = docDto.frontFileId
            ? await this.filesRepository.findOneBy({ id: docDto.frontFileId })
            : null;
          const backFile = docDto.backFileId
            ? await this.filesRepository.findOneBy({ id: docDto.backFileId })
            : null;

          const document = this.userDocumentRepository.create({
            ...docDto,
            user,
            frontFile,
            backFile,
          });
          return await this.userDocumentRepository.save(document);
        })
      );
    }

    if (updateUserDto.role) {
      await this.assignRole(user.id, updateUserDto.role);
    }

    // Permissions
    if (updateUserDto.permissions !== undefined) {
      await this.updateUserPermissions(user.id, updateUserDto.permissions);
    }

    // Strip out handled fields
    const { imageId, fileIds, companies, documents, ...updateData } = updateUserDto;

    if (imageId !== undefined) {
      user.image = imageId
        ? ({ id: imageId } as any)
        : null;
    }
    if (updateUserDto.password) {
      delete updateUserDto.password;
    }
    Object.assign(user, updateData);

    const savedUser = await this.usersRepository.save(user);
    return this.findItem(savedUser.id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }

  async restore(id: string): Promise<void> {
    await this.usersRepository.restore(id);
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    const user = await this.findOne(userId);
    const role = await this.rolesRepository.findOne({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    const existingUserRole = await this.userRolesRepository.findOne({
      where: { user: { id: userId }, role: { id: role.id } },
    });

    if (!existingUserRole) {
      const userRole = this.userRolesRepository.create({
        user,
        role,
      });
      await this.userRolesRepository.save(userRole);
    }

  }

  async assignPermission(
    userId: string,
    permissionName: string
  ): Promise<void> {
    const user = await this.findOne(userId);
    const permission = await this.permissionsRepository.findOne({
      where: { name: permissionName },
    });

    if (!permission) {
      throw new NotFoundException("Permission not found");
    }

    const existingUserPermission = await this.userPermissionsRepository.findOne(
      {
        where: { user: { id: userId }, permission: { id: permission.id } },
      }
    );

    if (existingUserPermission) {
      throw new ConflictException("User already has this permission");
    }

    const userPermission = this.userPermissionsRepository.create({
      user,
      permission,
    });

    await this.userPermissionsRepository.save(userPermission);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const userRole = await this.userRolesRepository.findOne({
      where: { user: { id: userId }, role: { id: roleId } },
    });

    if (!userRole) {
      throw new NotFoundException("User role not found");
    }

    await this.userRolesRepository.remove(userRole);
  }

  async removePermission(userId: string, permissionId: string): Promise<void> {
    const userPermission = await this.userPermissionsRepository.findOne({
      where: { user: { id: userId }, permission: { id: permissionId } },
    });

    if (!userPermission) {
      throw new NotFoundException("User permission not found");
    }

    await this.userPermissionsRepository.remove(userPermission);
  }

  private async createUserCreationAudit(
    targetUserId: string,
    createdByAdminId: string
  ): Promise<void> {
    const existingAudit = await this.userCreationAuditRepository.findOne({
      where: { targetUserId, createdByAdminId },
    });

    if (!existingAudit) {
      const auditEntry = this.userCreationAuditRepository.create({
        targetUserId,
        createdByAdminId,
      });

      await this.userCreationAuditRepository.save(auditEntry);
    }
  }

  async getUserCreationAudit(userId: string): Promise<UserCreationAudit[]> {
    return this.userCreationAuditRepository.find({
      where: { targetUserId: userId },
      relations: ["createdByAdmin"],
      order: { createdAt: "DESC" },
    });
  }

  async getAdminCreationHistory(adminId: string): Promise<UserCreationAudit[]> {
    return this.userCreationAuditRepository.find({
      where: { createdByAdminId: adminId },
      relations: ["targetUser"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Update all roles for a user (removes old, adds new)
   */
  async updateUserRoles(userId: string, roleNames: string[]): Promise<void> {
    const user = await this.findOne(userId);
    // Remove all current roles
    if (user.userRoles && user.userRoles.length > 0) {
      for (const userRole of user.userRoles) {
        await this.removeRole(userId, userRole.role.id);
      }
    }
    // Add new roles
    for (const roleName of roleNames) {
      await this.assignRole(userId, roleName);
    }
  }

  /**
   * Update all permissions for a user (removes old, adds new)
   */
  async updateUserPermissions(
    userId: string,
    permissionNames: string[]
  ): Promise<void> {
    const user = await this.findOne(userId);
    // Remove all current permissions
    if (user.userPermissions && user.userPermissions.length > 0) {
      for (const userPermission of user.userPermissions) {
        await this.removePermission(userId, userPermission.permission.id);
      }
    }
    // Add new permissions
    for (const permissionName of permissionNames) {
      await this.assignPermission(userId, permissionName);
    }
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
        await this.usersRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.usersRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.usersRepository.update(
          { id: In(ids) },
          { status: status as EntityStatus }
        );
        break;
    }

    const updated = await this.usersRepository.find({
      where: { id: In(ids) },
      relations: ["files"], // keep if user has file relation, else remove
    });

    return {
      status: "success",
      message: "Users updated successfully",
      items: updated.map(toUserResource), // replace with user resource transformer
    };
  }

}
