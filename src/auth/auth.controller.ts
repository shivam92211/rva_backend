import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Ip,
  Headers,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  email: string;
  password: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Request() req: any,
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(
      req.user,
      ip || 'unknown',
      userAgent || 'unknown',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Request() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    await this.authService.logout(
      req.user.id,
      ip || 'unknown',
      userAgent || 'unknown',
    );
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid or expired' })
  verifyToken(@Request() req: any) {
    return {
      valid: true,
      admin: req.user,
      message: 'Token is valid',
    };
  }
}
