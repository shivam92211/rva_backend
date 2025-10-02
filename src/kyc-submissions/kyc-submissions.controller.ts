import {
  Controller,
  Get,
  Patch,
  Query,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { KycSubmissionsService } from './kyc-submissions.service';

@ApiTags('kyc-submissions')
@Controller('kyc-submissions')
export class KycSubmissionsController {
  constructor(private readonly kycSubmissionsService: KycSubmissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of KYC submissions' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of submissions per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for user details, ID number, or nationality',
    example: 'john',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      'Filter by KYC status: pending, processing, approved, rejected',
    example: 'pending',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    description: 'Filter by KYC level: 1, 2, 3',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved KYC submissions with pagination',
    schema: {
      type: 'object',
      properties: {
        kycSubmissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clx123kyc456789' },
              userId: { type: 'string', example: 'clx123user456789' },
              level: { type: 'number', example: 1 },
              status: { type: 'string', example: 'PENDING' },
              firstName: { type: 'string', example: 'John' },
              lastName: { type: 'string', example: 'Doe' },
              dateOfBirth: { type: 'string', format: 'date-time' },
              nationality: { type: 'string', example: 'United States' },
              idType: { type: 'string', example: 'passport' },
              idNumber: { type: 'string', example: 'P123456789' },
              submittedAt: { type: 'string', format: 'date-time' },
              reviewedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
              },
              reviewedBy: { type: 'string', nullable: true },
              rejectionReason: { type: 'string', nullable: true },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            totalPages: { type: 'number', example: 5 },
            totalCount: { type: 'number', example: 50 },
            limit: { type: 'number', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  async getKycSubmissions(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('level') level?: string,
  ) {
    // Ensure valid pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 submissions per page

    return this.kycSubmissionsService.getKycSubmissions(
      validPage,
      validLimit,
      search,
      status,
      level,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get KYC submission by ID' })
  @ApiParam({
    name: 'id',
    description: 'KYC submission ID',
    example: 'clx123kyc456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved KYC submission',
  })
  @ApiResponse({
    status: 404,
    description: 'KYC submission not found',
  })
  async getKycSubmissionById(@Param('id') id: string) {
    return this.kycSubmissionsService.getKycSubmissionById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update KYC submission status' })
  @ApiParam({
    name: 'id',
    description: 'KYC submission ID',
    example: 'clx123kyc456789',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED'],
          example: 'APPROVED',
        },
        reviewedBy: { type: 'string', example: 'admin_user' },
        rejectionReason: {
          type: 'string',
          example: 'Document quality is too poor',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'KYC submission status updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx123kyc456789' },
        status: { type: 'string', example: 'APPROVED' },
        message: {
          type: 'string',
          example: 'KYC submission for john_doe approved successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'KYC submission not found',
  })
  async updateKycSubmissionStatus(
    @Param('id') id: string,
    @Body()
    body: { status: string; reviewedBy?: string; rejectionReason?: string },
  ) {
    return this.kycSubmissionsService.updateKycSubmissionStatus(
      id,
      body.status,
      body.reviewedBy,
      body.rejectionReason,
    );
  }
}
