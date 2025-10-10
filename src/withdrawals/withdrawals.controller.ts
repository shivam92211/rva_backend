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
import { WithdrawalsService } from './withdrawals.service';

@ApiTags('withdrawals')
@Controller('api/v1/withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of withdrawals' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of withdrawals per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by withdrawal status: PENDING, PROCESSING, COMPLETED, REJECTED, CANCELLED',
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
    description: 'Successfully retrieved withdrawals with pagination',
    schema: {
      type: 'object',
      properties: {
        withdrawals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clx123withdrawal456789' },
              userId: { type: 'string', example: 'clx123user456789' },
              beneficiaryId: { type: 'string', nullable: true },
              amount: { type: 'string', example: '500.00' },
              fee: { type: 'string', example: '0.50' },
              totalAmount: { type: 'string', example: '500.50' },
              toAddress: { type: 'string', example: '0x742d35Cc...' },
              memo: { type: 'string', nullable: true },
              status: { type: 'string', example: 'COMPLETED' },
              txHash: { type: 'string', nullable: true },
              emailVerified: { type: 'boolean', example: true },
              google2FAVerified: { type: 'boolean', example: true },
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
  async getWithdrawals(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100);

    return this.withdrawalsService.getWithdrawals(
      validPage,
      validLimit,
      status,
      userId,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Get paginated list of KuCoin withdrawal history' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of withdrawals per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    example: 'SUCCESS',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
    example: 'clx123user456789',
  })
  async getKucoinWithdrawalHistory(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100);

    return this.withdrawalsService.getKucoinWithdrawalHistory(
      validPage,
      validLimit,
      status,
      userId,
    );
  }

  @Get('history/:id')
  @ApiOperation({ summary: 'Get KuCoin withdrawal history by ID' })
  @ApiParam({ name: 'id', description: 'Withdrawal History ID' })
  async getKucoinWithdrawalHistoryById(@Param('id') id: string) {
    return this.withdrawalsService.getKucoinWithdrawalHistoryById(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get withdrawal request by ID' })
  @ApiParam({ name: 'id', description: 'Withdrawal ID', example: 'clx123withdrawal456789' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved withdrawal details',
  })
  @ApiResponse({
    status: 404,
    description: 'Withdrawal not found',
  })
  async getWithdrawalById(@Param('id') id: string) {
    return this.withdrawalsService.getWithdrawalById(id);
  }
}
