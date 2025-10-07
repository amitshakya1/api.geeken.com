import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { SendPhoneOtpDto } from "./dto/send-phone-otp.dto";
import { VerifyPhoneOtpDto } from "./dto/verify-phone-otp.dto";
import { SendEmailOtpDto } from "./dto/send-email-otp.dto";
import { VerifyEmailOtpDto } from "./dto/verify-email-otp.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import {
  ThrottleAuth,
  ThrottleStrict,
} from "../../common/decorators/throttle.decorator";

@ApiTags("auth")
@Controller("website/auth")
@UseInterceptors(ResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("login")
  @ThrottleAuth()
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({ status: 200, description: "Login successful" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("register")
  @ThrottleAuth()
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "Registration successful" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("send-email-otp")
  @ThrottleStrict()
  @ApiOperation({ summary: "Send OTP to email" })
  @ApiResponse({ status: 200, description: "OTP sent successfully" })
  async sendEmailOtp(@Body() sendEmailOtpDto: SendEmailOtpDto) {
    return this.authService.sendEmailOtp(sendEmailOtpDto);
  }

  @Post("send-phone-otp")
  @ThrottleStrict()
  @ApiOperation({ summary: "Send OTP to phone" })
  @ApiResponse({ status: 200, description: "OTP sent successfully" })
  async sendPhoneOtp(@Body() sendPhoneOtpDto: SendPhoneOtpDto) {
    return this.authService.sendPhoneOtp(sendPhoneOtpDto);
  }

  @Post("verify-email-otp")
  @ApiOperation({ summary: "Verify email OTP and login" })
  @ApiResponse({ status: 200, description: "OTP verified successfully" })
  async verifyEmailOtp(@Body() verifyEmailOtpDto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(verifyEmailOtpDto);
  }

  @Post("verify-phone-otp")
  @ApiOperation({ summary: "Verify phone OTP and login" })
  @ApiResponse({ status: 200, description: "OTP verified successfully" })
  async verifyPhoneOtp(@Body() verifyPhoneOtpDto: VerifyPhoneOtpDto) {
    return this.authService.verifyPhoneOtp(verifyPhoneOtpDto);
  }

  @Post("forgot-password")
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({ status: 200, description: "Password reset link sent" })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset password with token" })
  @ApiResponse({ status: 200, description: "Password reset successful" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Profile retrieved successfully" })
  async getProfile(@CurrentUser() user) {
    return this.authService.getProfile(user.id);
  }

  @Post("update-profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  async updateProfile(@CurrentUser() user, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change user password" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  async changePassword(@CurrentUser() user, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout current user" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  logout(@CurrentUser() user) {
    return this.authService.logout(user.id);
  }
}
