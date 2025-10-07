import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "../../common/entities/user.entity";
import { UserRole } from "../../common/entities/user-role.entity";
import { UserPermission } from "../../common/entities/user-permission.entity";
import { UserCreationAudit } from "../../common/entities/user-creation-audit.entity";
import { Role } from "../../common/entities/role.entity";
import { Permission } from "../../common/entities/permission.entity";
import { File } from "../../common/entities/file.entity";
import { UserCompany } from "../../common/entities/user-company.entity";
import { UserDocument } from "../../common/entities/user-document.entity";
import { CompanyBankAccount } from "../../common/entities/company-bank-account.entity";
import { CompanyAddress } from "../../common/entities/company-address.entity";
import { CompanyDocument } from "../../common/entities/company-document.entity";
import { ProductCommission } from "../../common/entities/product-commission.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      UserPermission,
      UserCreationAudit,
      Role,
      Permission,
      UserDocument,
      UserCompany,
      CompanyBankAccount,
      CompanyAddress,
      ProductCommission,
      CompanyDocument,
      User,
      File,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
