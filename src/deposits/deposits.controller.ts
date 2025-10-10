import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { DepositsService } from './deposits.service';

@ApiTags('deposits')
@Controller('api/v1/deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of deposits' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of deposits per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by deposit status: PENDING, CONFIRMED, COMPLETED, FAILED',
    example: 'COMPLETED',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
    example: 'clx123user456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved deposits with pagination',
    schema: {
      type: 'object',
      properties: {
        deposits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clx123deposit456789' },
              userId: { type: 'string', example: 'clx123user456789' },
              txHash: { type: 'string', example: '0x8f9e2c1a5b4d3f6e...' },
              amount: { type: 'string', example: '1000.00' },
              confirmations: { type: 'number', example: 12 },
              requiredConfirmations: { type: 'number', example: 3 },
              status: { type: 'string', example: 'COMPLETED' },
              fromAddress: { type: 'string', nullable: true },
              toAddress: { type: 'string', example: '0x742d35Cc...' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                  firstName: { type: 'string', nullable: true },
                  lastName: { type: 'string', nullable: true },
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
  async getDeposits(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100);

    return this.depositsService.getDeposits(
      validPage,
      validLimit,
      status,
      userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deposit by ID' })
  @ApiParam({ name: 'id', description: 'Deposit ID', example: 'clx123deposit456789' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved deposit details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx123deposit456789' },
        userId: { type: 'string', example: 'clx123user456789' },
        txHash: { type: 'string', example: '0x8f9e2c1a5b4d3f6e...' },
        amount: { type: 'string', example: '1000.00' },
        confirmations: { type: 'number', example: 12 },
        requiredConfirmations: { type: 'number', example: 3 },
        status: { type: 'string', example: 'COMPLETED' },
        fromAddress: { type: 'string', nullable: true },
        toAddress: { type: 'string', example: '0x742d35Cc...' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            firstName: { type: 'string', nullable: true },
            lastName: { type: 'string', nullable: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Deposit not found',
  })
  async getDepositById(@Param('id') id: string) {
    return this.depositsService.getDepositById(id);
  }
}
