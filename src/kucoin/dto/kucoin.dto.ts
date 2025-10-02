import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TransferDirection {
  OUT = 'OUT',
  IN = 'IN',
}

export enum AccountType {
  MAIN = 'MAIN',
  TRADE = 'TRADE',
  CONTRACT = 'CONTRACT',
}

export enum TransactionStatus {
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export enum ApiPermission {
  GENERAL = 'general',
  SPOT = 'spot',
  FUTURES = 'futures',
}

export enum TradeType {
  SPOT = 1,
  FUTURES = 2,
}

export class GetBrokerInfoDto {
  @ApiProperty()
  @IsDateString()
  begin: string;

  @ApiProperty()
  @IsDateString()
  end: string;

  @ApiProperty({ enum: TradeType })
  @IsEnum(TradeType)
  tradeType: TradeType;
}

export class CreateSubAccountDto {
  @ApiProperty()
  @IsString()
  accountName: string;
}

export class GetSubAccountsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  uid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  currentPage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pageSize?: number;
}

export class CreateApiKeyDto {
  @ApiProperty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsString()
  passphrase: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ipWhitelist: string[];

  @ApiProperty({ enum: ApiPermission, isArray: true })
  @IsArray()
  @IsEnum(ApiPermission, { each: true })
  permissions: ApiPermission[];

  @ApiProperty()
  @IsString()
  label: string;
}

export class ModifyApiKeyDto {
  @ApiProperty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsString()
  apiKey: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ipWhitelist: string[];

  @ApiProperty({ enum: ApiPermission, isArray: true })
  @IsArray()
  @IsEnum(ApiPermission, { each: true })
  permissions: ApiPermission[];

  @ApiProperty()
  @IsString()
  label: string;
}

export class GetApiKeysDto {
  @ApiProperty()
  @IsString()
  uid: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiKey?: string;
}

export class DeleteApiKeyDto {
  @ApiProperty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsString()
  apiKey: string;
}

export class TransferDto {
  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsString()
  amount: string;

  @ApiProperty()
  @IsString()
  clientOid: string;

  @ApiProperty({ enum: TransferDirection })
  @IsEnum(TransferDirection)
  direction: TransferDirection;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty()
  @IsString()
  specialUid: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  specialAccountType: AccountType;
}

export class GetTransferHistoryDto {
  @ApiProperty()
  @IsString()
  orderId: string;
}

export class GetDepositListDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hash?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  startTimestamp?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  endTimestamp?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class GetDepositDetailDto {
  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsString()
  hash: string;
}

export class GetWithdrawDetailDto {
  @ApiProperty()
  @IsString()
  withdrawalId: string;
}

export class RebateDownloadDto {
  @ApiProperty()
  @IsDateString()
  begin: string;

  @ApiProperty()
  @IsDateString()
  end: string;

  @ApiProperty({ enum: TradeType })
  @IsEnum(TradeType)
  tradeType: TradeType;
}
