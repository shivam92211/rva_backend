import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KucoinService } from './kucoin.service';
import {
  GetBrokerInfoDto,
  CreateSubAccountDto,
  GetSubAccountsDto,
  CreateApiKeyDto,
  ModifyApiKeyDto,
  GetApiKeysDto,
  DeleteApiKeyDto,
  TransferDto,
  GetTransferHistoryDto,
  GetDepositListDto,
  GetDepositDetailDto,
  GetWithdrawDetailDto,
  RebateDownloadDto,
} from './dto/kucoin.dto';

@ApiTags('kucoin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kucoin')
export class KucoinController {
  private readonly logger = new Logger(KucoinController.name);

  constructor(private readonly kucoinService: KucoinService) {}

  @Get('broker/info')
  @ApiOperation({ summary: 'Get broker information' })
  @ApiResponse({
    status: 200,
    description: 'Broker information retrieved successfully',
  })
  async getBrokerInfo(@Query() params: GetBrokerInfoDto) {
    try {
      return await this.kucoinService.getBrokerInfo(params);
    } catch (error) {
      this.logger.error(`Failed to get broker info: ${error.message}`);
      throw new HttpException(
        `Failed to get broker info: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('broker/credentials')
  @ApiOperation({ summary: 'Get broker credentials status' })
  @ApiResponse({
    status: 200,
    description: 'Broker credentials status retrieved successfully',
  })
  getBrokerCredentials() {
    return this.kucoinService.getBrokerCredentials();
  }

  @Post('sub-accounts')
  @ApiOperation({ summary: 'Create a new sub-account' })
  @ApiResponse({ status: 201, description: 'Sub-account created successfully' })
  async createSubAccount(@Body() createSubAccountDto: CreateSubAccountDto) {
    try {
      return await this.kucoinService.createSubAccount(createSubAccountDto);
    } catch (error) {
      this.logger.error(`Failed to create sub-account: ${error.message}`);
      throw new HttpException(
        `Failed to create sub-account: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('sub-accounts')
  @ApiOperation({ summary: 'Get sub-accounts list' })
  @ApiResponse({
    status: 200,
    description: 'Sub-accounts retrieved successfully',
  })
  async getSubAccounts(@Query() params: GetSubAccountsDto) {
    try {
      return await this.kucoinService.getSubAccounts(params);
    } catch (error) {
      this.logger.error(`Failed to get sub-accounts: ${error.message}`);
      throw new HttpException(
        `Failed to get sub-accounts: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('api-keys')
  @ApiOperation({ summary: 'Create API key for sub-account' })
  @ApiResponse({ status: 201, description: 'API key created successfully' })
  async createApiKey(@Body() createApiKeyDto: CreateApiKeyDto) {
    try {
      return await this.kucoinService.createApiKey(createApiKeyDto);
    } catch (error) {
      this.logger.error(`Failed to create API key: ${error.message}`);
      throw new HttpException(
        `Failed to create API key: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('api-keys')
  @ApiOperation({ summary: 'Get API keys for sub-account' })
  @ApiResponse({ status: 200, description: 'API keys retrieved successfully' })
  async getApiKeys(@Query() params: GetApiKeysDto) {
    try {
      return await this.kucoinService.getApiKeys(params);
    } catch (error) {
      this.logger.error(`Failed to get API keys: ${error.message}`);
      throw new HttpException(
        `Failed to get API keys: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('api-keys/modify')
  @ApiOperation({ summary: 'Modify API key for sub-account' })
  @ApiResponse({ status: 200, description: 'API key modified successfully' })
  async modifyApiKey(@Body() modifyApiKeyDto: ModifyApiKeyDto) {
    try {
      return await this.kucoinService.modifyApiKey(modifyApiKeyDto);
    } catch (error) {
      this.logger.error(`Failed to modify API key: ${error.message}`);
      throw new HttpException(
        `Failed to modify API key: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('api-keys')
  @ApiOperation({ summary: 'Delete API key for sub-account' })
  @ApiResponse({ status: 200, description: 'API key deleted successfully' })
  async deleteApiKey(@Query() params: DeleteApiKeyDto) {
    try {
      return await this.kucoinService.deleteApiKey(params);
    } catch (error) {
      this.logger.error(`Failed to delete API key: ${error.message}`);
      throw new HttpException(
        `Failed to delete API key: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer funds between accounts' })
  @ApiResponse({ status: 201, description: 'Transfer initiated successfully' })
  async transfer(@Body() transferDto: TransferDto) {
    try {
      return await this.kucoinService.transfer(transferDto);
    } catch (error) {
      this.logger.error(`Failed to initiate transfer: ${error.message}`);
      throw new HttpException(
        `Failed to initiate transfer: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('transfer/history')
  @ApiOperation({ summary: 'Get transfer history details' })
  @ApiResponse({
    status: 200,
    description: 'Transfer history retrieved successfully',
  })
  async getTransferHistory(@Query() params: GetTransferHistoryDto) {
    try {
      return await this.kucoinService.getTransferHistory(params);
    } catch (error) {
      this.logger.error(`Failed to get transfer history: ${error.message}`);
      throw new HttpException(
        `Failed to get transfer history: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('deposits')
  @ApiOperation({ summary: 'Get deposit list' })
  @ApiResponse({
    status: 200,
    description: 'Deposit list retrieved successfully',
  })
  async getDepositList(@Query() params: GetDepositListDto) {
    try {
      return await this.kucoinService.getDepositList(params);
    } catch (error) {
      this.logger.error(`Failed to get deposit list: ${error.message}`);
      throw new HttpException(
        `Failed to get deposit list: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('deposits/detail')
  @ApiOperation({ summary: 'Get deposit details' })
  @ApiResponse({
    status: 200,
    description: 'Deposit details retrieved successfully',
  })
  async getDepositDetail(@Query() params: GetDepositDetailDto) {
    try {
      return await this.kucoinService.getDepositDetail(params);
    } catch (error) {
      this.logger.error(`Failed to get deposit detail: ${error.message}`);
      throw new HttpException(
        `Failed to get deposit detail: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('withdrawals/detail')
  @ApiOperation({ summary: 'Get withdrawal details' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal details retrieved successfully',
  })
  async getWithdrawDetail(@Query() params: GetWithdrawDetailDto) {
    try {
      return await this.kucoinService.getWithdrawDetail(params);
    } catch (error) {
      this.logger.error(`Failed to get withdrawal detail: ${error.message}`);
      throw new HttpException(
        `Failed to get withdrawal detail: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('rebate/download')
  @ApiOperation({ summary: 'Download broker rebate data' })
  @ApiResponse({
    status: 200,
    description: 'Rebate data retrieved successfully',
  })
  async downloadBrokerRebate(@Query() params: RebateDownloadDto) {
    try {
      return await this.kucoinService.downloadBrokerRebate(params);
    } catch (error) {
      this.logger.error(`Failed to download rebate data: ${error.message}`);
      throw new HttpException(
        `Failed to download rebate data: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
