import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { User } from "../../common/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SendPhoneOtpDto } from "./dto/send-phone-otp.dto";
import { VerifyPhoneOtpDto } from "./dto/verify-phone-otp.dto";
import { SendEmailOtpDto } from "./dto/send-email-otp.dto";
import { VerifyEmailOtpDto } from "./dto/verify-email-otp.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import * as bcrypt from "bcryptjs";

import { v4 as uuidv4 } from "uuid";
import { toUserResource } from "../users/user.resource";
import { In, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { File } from "../../common/entities/file.entity";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  private _createJwtPayload(user: User, permissions: string[] = []) {
    return {
      email: user.email,
      sub: user.id,
      permissions,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && (await user.validatePassword(password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.status != "active") {
      throw new UnauthorizedException("Account is disabled");
    }

    const roles = this.getUserRoles(user);
    if (
      !roles.includes("super_admin") &&
      !roles.includes("admin") &&
      !roles.includes("partner") &&
      !roles.includes("employee")
    ) {
      throw new UnauthorizedException("Sorry! You don't have access.");
    }
    // Get user permissions and roles
    const userWithRoles = await this.usersService.findByEmail(loginDto.email);

    const permissions = this.getUserPermissions(userWithRoles);

    const payload = this._createJwtPayload(user, permissions);

    // Update last login
    await this.usersService.update(user.id, { lastLoginAt: new Date() } as any);

    return {
      access_token: this.jwtService.sign(payload),
      user: toUserResource(user),
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    const payload = this._createJwtPayload(user);

    return {
      access_token: this.jwtService.sign(payload),
      user: toUserResource(user),
    };
  }

  async sendEmailOtp(sendEmailOtpDto: SendEmailOtpDto) {
    const user = await this.usersService.findByEmail(sendEmailOtpDto.email);

    if (user.status != "active") {
      throw new UnauthorizedException("Account is disabled");
    }

    const roles = this.getUserRoles(user);
    if (
      !roles.includes("super_admin") &&
      !roles.includes("admin") &&
      !roles.includes("partner") &&
      !roles.includes("employee")
    ) {
      throw new UnauthorizedException("Sorry! You don't have access.");
    }

    // Generate OTP (mock implementation)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In real implementation, save OTP to database and send via email
    console.log(`Email OTP for ${sendEmailOtpDto.email}: ${otp}`);

    return {
      message: "OTP sent to email successfully",
      // In production, don't return OTP
      otp: otp,
    };
  }

  async sendPhoneOtp(sendPhoneOtpDto: SendPhoneOtpDto) {
    // Find user by phone
    const user = await this.usersService.findByPhone(sendPhoneOtpDto.phone);

    if (user.status != "active") {
      throw new UnauthorizedException("Account is disabled");
    }

    const roles = this.getUserRoles(user);
    if (
      !roles.includes("super_admin") &&
      !roles.includes("admin") &&
      !roles.includes("partner") &&
      !roles.includes("employee")
    ) {
      throw new UnauthorizedException("Sorry! You don't have access.");
    }

    // Generate OTP (mock implementation)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In real implementation, save OTP to database and send via SMS
    console.log(`Phone OTP for ${sendPhoneOtpDto.phone}: ${otp}`);

    return {
      message: "OTP sent to phone successfully",
      // In production, don't return OTP
      otp: otp,
    };
  }

  async verifyEmailOtp(verifyEmailOtpDto: VerifyEmailOtpDto) {
    const user = await this.usersService.findByEmail(verifyEmailOtpDto.email);

    // In real implementation, verify OTP from database
    // For demo purposes, accept any 6-digit OTP
    if (verifyEmailOtpDto.otp.length !== 6) {
      throw new BadRequestException("Invalid OTP");
    }

    const permissions = this.getUserPermissions(user);

    const payload = this._createJwtPayload(user, permissions);

    await this.usersService.update(user.id, { lastLoginAt: new Date() } as any);
    return {
      access_token: this.jwtService.sign(payload),
      user: toUserResource(user),
    };
  }

  async verifyPhoneOtp(verifyPhoneOtpDto: VerifyPhoneOtpDto) {
    // Find user by phone
    const user = await this.usersService.findOne(verifyPhoneOtpDto.phone);

    // In real implementation, verify OTP from database
    // For demo purposes, accept any 6-digit OTP
    if (verifyPhoneOtpDto.otp.length !== 6) {
      throw new BadRequestException("Invalid OTP");
    }

    const permissions = this.getUserPermissions(user);

    const payload = this._createJwtPayload(user, permissions);

    await this.usersService.update(user.id, { lastLoginAt: new Date() } as any);
    return {
      access_token: this.jwtService.sign(payload),
      user: toUserResource(user),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.usersService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    } as any);

    // In real implementation, send email with reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log(
      `Password reset link for ${forgotPasswordDto.email}: ${resetLink}`
    );

    return {
      message: "Password reset link sent to email",
      // In production, don't return reset token
      resetToken: resetToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(
      resetPasswordDto.token
    );

    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== resetPasswordDto.token
    ) {
      throw new BadRequestException("Invalid reset token");
    }

    if (new Date() > user.passwordResetExpires) {
      throw new BadRequestException("Reset token expired");
    }
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
    await this.usersService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    } as any);

    return {
      message: "Password reset successfully",
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    const permissions = this.getUserPermissions(user);

    return toUserResource(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.findOne(userId);
    await this.usersService.update(userId, dto);
    const updatedUser = await this.usersService.findOne(userId);
    return toUserResource(updatedUser);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    console.log(user);
    if (!(await user.validatePassword(dto.oldPassword))) {
      throw new BadRequestException("Old password is incorrect");
    }
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.update(userId, { password: hashedPassword });
    return { message: "Password changed successfully" };
  }

  private getUserPermissions(user: User): string[] {
    const permissions = [];

    // Add direct permissions
    if (user.userPermissions) {
      permissions.push(...user.userPermissions.map((up) => up.permission.name));
    }

    // Add permissions from roles
    if (user.userRoles) {
      user.userRoles.forEach((userRole) => {
        if (userRole.role.rolePermissions) {
          permissions.push(
            ...userRole.role.rolePermissions.map((rp) => rp.permission.name)
          );
        }
      });
    }

    return [...new Set(permissions)];
  }

  private getUserRoles(user: User): string[] {
    const roles = [];
    if (user.userRoles) {
      roles.push(...user.userRoles.map((ur) => ur.role.name));
    }
    return [...new Set(roles)];
  }

  async logout(userId: string) {
    // If you want to implement token blacklisting, do it here.
    // For now, just return a message.
    return { message: "Logout successful" };
  }
}
