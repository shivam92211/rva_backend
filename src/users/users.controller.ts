import { Controller, Get, Patch, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of users' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of users per page (default: 10, max: 100)', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for username, email, firstName, or lastName', example: 'john' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by user status: active or inactive', example: 'active' })
  @ApiQuery({ name: 'whitelist', required: false, description: 'Filter by withdrawal whitelist status: whitelisted or not_whitelisted', example: 'whitelisted' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved users with pagination',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clx123admin456789' },
              uid: { type: 'number', example: 1 },
              email: { type: 'string', example: 'admin@example.com' },
              username: { type: 'string', example: 'admin_user' },
              firstName: { type: 'string', example: 'Admin' },
              lastName: { type: 'string', example: 'User' },
              phone: { type: 'string', example: '+1234567890' },
              profilePicture: { type: 'string', nullable: true },
              loginType: { type: 'string', example: 'PASSWORD' },
              isEmailVerified: { type: 'boolean', example: true },
              isPhoneVerified: { type: 'boolean', example: true },
              isKycVerified: { type: 'boolean', example: true },
              withdrawalWhitelist: { type: 'boolean', example: false },
              kycLevel: { type: 'number', example: 2 },
              isActive: { type: 'boolean', example: true },
              isFrozen: { type: 'boolean', example: false },
              isGoogle2FAEnabled: { type: 'boolean', example: false },
              lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            totalPages: { type: 'number', example: 5 },
            totalCount: { type: 'number', example: 50 },
            limit: { type: 'number', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false }
          }
        }
      }
    }
  })
  async getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('whitelist') whitelist?: string,
  ) {
    // Ensure valid pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 users per page

    return this.usersService.getUsers(validPage, validLimit, search, status, whitelist);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active/inactive status' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'clx123user456789' })
  @ApiResponse({
    status: 200,
    description: 'User status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx123user456789' },
        isActive: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User status updated successfully' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async toggleUserStatus(@Param('id') id: string) {
    return this.usersService.toggleUserStatus(id);
  }

  @Patch(':id/toggle-whitelist')
  @ApiOperation({ summary: 'Toggle user withdrawal whitelist status' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'clx123user456789' })
  @ApiResponse({
    status: 200,
    description: 'User withdrawal whitelist status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx123user456789' },
        withdrawalWhitelist: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User withdrawal whitelist updated successfully' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async toggleWithdrawalWhitelist(@Param('id') id: string) {
    return this.usersService.toggleWithdrawalWhitelist(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'clx123user456789' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx123user456789' },
        uid: { type: 'number', example: 1 },
        email: { type: 'string', example: 'user@example.com' },
        username: { type: 'string', example: 'username' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        phone: { type: 'string', example: '+1234567890' },
        profilePicture: { type: 'string', nullable: true },
        loginType: { type: 'string', example: 'PASSWORD' },
        isEmailVerified: { type: 'boolean', example: true },
        isPhoneVerified: { type: 'boolean', example: true },
        isKycVerified: { type: 'boolean', example: true },
        withdrawalWhitelist: { type: 'boolean', example: false },
        kycLevel: { type: 'number', example: 2 },
        isActive: { type: 'boolean', example: true },
        isFrozen: { type: 'boolean', example: false },
        isGoogle2FAEnabled: { type: 'boolean', example: false },
        lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Get(':id/devices')
  @ApiOperation({ summary: 'Get user devices and refresh tokens' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'clx123user456789' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user devices',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'clx123user456789' },
        devices: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'device_001' },
              ipAddress: { type: 'string', example: '192.168.1.100' },
              userAgent: { type: 'string', example: 'Mozilla/5.0 (Windows NT 10.0...)' },
              location: {
                type: 'object',
                properties: {
                  lat: { type: 'number', example: 40.7128 },
                  lng: { type: 'number', example: -74.0060 },
                  city: { type: 'string', example: 'New York' },
                  country: { type: 'string', example: 'US' }
                }
              },
              timezone: { type: 'string', example: 'America/New_York' },
              fingerprint: { type: 'string', example: 'win_chrome_192168100_001' },
              refreshTokens: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'token_001' },
                    isActive: { type: 'boolean', example: true },
                    expiresAt: { type: 'string', format: 'date-time' },
                    createdAt: { type: 'string', format: 'date-time' }
                  }
                }
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async getUserDevices(@Param('id') id: string) {
    return this.usersService.getUserDevices(id);
  }
}