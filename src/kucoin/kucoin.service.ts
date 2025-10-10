import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import * as CryptoJS from 'crypto-js';
import { firstValueFrom } from 'rxjs';
import {
  ApiResponse,
  BrokerInfo,
  SubAccount,
  PaginatedResponse,
  ApiKeyInfo,
  TransferResponse,
  TransferDetail,
  DepositRecord,
  DepositDetail,
  WithdrawalDetail,
} from './interfaces/kucoin.interface';
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
  CreateTradingPairDto,
} from './dto/kucoin.dto';

@Injectable()
export class KucoinService {
  private readonly logger = new Logger(KucoinService.name);
  private readonly baseURL = 'https://api.kucoin.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get brokerApiKey(): string {
    return this.configService.get<string>('KUCOIN_BROKER_API_KEY') || '';
  }

  private get brokerApiSecret(): string {
    return this.configService.get<string>('KUCOIN_BROKER_API_SECRET') || '';
  }

  private get brokerApiPassphrase(): string {
    return this.configService.get<string>('KUCOIN_BROKER_API_PASSPHRASE') || '';
  }

  private get brokerPartnerKey(): string {
    return this.configService.get<string>('KUCOIN_BROKER_PARTNER_KEY') || '';
  }

  private get brokerName(): string {
    return this.configService.get<string>('KUCOIN_BROKER_NAME') || '';
  }

  private generateSignature(
    timestamp: string,
    method: string,
    endpoint: string,
    body: string,
    secret: string,
  ): string {
    const str = timestamp + method.toUpperCase() + endpoint + body;
    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(str, secret));
  }

  private generatePartnerSignature(
    timestamp: string,
    partnerKey: string,
    apiKey: string,
  ): string {
    const str = timestamp + partnerKey + apiKey;
    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(str, partnerKey));
  }

  private createAuthHeaders(
    method: string,
    endpoint: string,
    body: string = '',
  ): Record<string, string> {
    const timestamp = Date.now().toString();
    const signature = this.generateSignature(
      timestamp,
      method,
      endpoint,
      body,
      this.brokerApiSecret,
    );

    const encryptedPassphrase = CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(this.brokerApiPassphrase, this.brokerApiSecret),
    );

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'KC-API-KEY': this.brokerApiKey,
      'KC-API-SIGN': signature,
      'KC-API-TIMESTAMP': timestamp,
      'KC-API-PASSPHRASE': encryptedPassphrase,
      'KC-API-KEY-VERSION': '2',
    };

    if (this.brokerPartnerKey) {
      const partnerSign = this.generatePartnerSignature(
        timestamp,
        this.brokerPartnerKey,
        this.brokerApiKey,
      );
      headers['KC-API-PARTNER'] = this.brokerPartnerKey;
      headers['KC-API-PARTNER-SIGN'] = partnerSign;
      headers['KC-API-PARTNER-VERIFY'] = 'true';
    }

    if (this.brokerName) {
      headers['KC-BROKER-NAME'] = this.brokerName;
    }

    return headers;
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    data?: any,
    params?: any,
  ): Promise<T> {
    try {
      let fullEndpoint = endpoint;
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        fullEndpoint = `${endpoint}?${searchParams.toString()}`;
      }

      const body = data ? JSON.stringify(data) : '';
      const headers = this.createAuthHeaders(method, fullEndpoint, body);

      const config: AxiosRequestConfig = {
        method,
        url: `${this.baseURL}${fullEndpoint}`,
        headers,
        timeout: 30000,
      };

      if (data) {
        config.data = data;
      }

      if (params) {
        config.params = params;
      }

      this.logger.debug(`Making ${method} request to ${fullEndpoint}`);

      const response = await firstValueFrom(
        this.httpService.request<ApiResponse<T>>(config),
      );

      if (response.data.code !== '200000') {
        throw new Error(
          `KuCoin API Error: ${response.data.msg || 'Unknown error'}`,
        );
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(
        `KuCoin API request failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  isBrokerConfigured(): boolean {
    return !!(
      this.brokerApiKey &&
      this.brokerApiSecret &&
      this.brokerApiPassphrase
    );
  }

  getBrokerCredentials() {
    return {
      apiKey: this.brokerApiKey,
      hasSecret: !!this.brokerApiSecret,
      hasPassphrase: !!this.brokerApiPassphrase,
      partnerKey: this.brokerPartnerKey,
      brokerName: this.brokerName,
      isConfigured: this.isBrokerConfigured(),
    };
  }

  async getBrokerInfo(params: GetBrokerInfoDto): Promise<BrokerInfo> {
    return this.makeRequest<BrokerInfo>(
      'GET',
      '/api/v1/broker/nd/info',
      null,
      params,
    );
  }

  async createSubAccount(data: CreateSubAccountDto): Promise<SubAccount> {
    return this.makeRequest<SubAccount>(
      'POST',
      '/api/v1/broker/nd/account',
      data,
    );
  }

  async getSubAccounts(
    params?: GetSubAccountsDto,
  ): Promise<PaginatedResponse<SubAccount>> {
    return this.makeRequest<PaginatedResponse<SubAccount>>(
      'GET',
      '/api/v1/broker/nd/account',
      null,
      params,
    );
  }

  async createApiKey(data: CreateApiKeyDto): Promise<ApiKeyInfo> {
    return this.makeRequest<ApiKeyInfo>(
      'POST',
      '/api/v1/broker/nd/account/apikey',
      data,
    );
  }

  async getApiKeys(params: GetApiKeysDto): Promise<ApiKeyInfo[]> {
    return this.makeRequest<ApiKeyInfo[]>(
      'GET',
      '/api/v1/broker/nd/account/apikey',
      null,
      params,
    );
  }

  async modifyApiKey(data: ModifyApiKeyDto): Promise<ApiKeyInfo> {
    return this.makeRequest<ApiKeyInfo>(
      'POST',
      '/api/v1/broker/nd/account/update-apikey',
      data,
    );
  }

  async deleteApiKey(params: DeleteApiKeyDto): Promise<boolean> {
    return this.makeRequest<boolean>(
      'DELETE',
      '/api/v1/broker/nd/account/apikey',
      null,
      params,
    );
  }

  async transfer(data: TransferDto): Promise<TransferResponse> {
    return this.makeRequest<TransferResponse>(
      'POST',
      '/api/v1/broker/nd/transfer',
      data,
    );
  }

  async getTransferHistory(
    params: GetTransferHistoryDto,
  ): Promise<TransferDetail> {
    return this.makeRequest<TransferDetail>(
      'GET',
      '/api/v3/broker/nd/transfer/detail',
      null,
      params,
    );
  }

  async getDepositList(params?: GetDepositListDto): Promise<DepositRecord[]> {
    return this.makeRequest<DepositRecord[]>(
      'GET',
      '/api/v1/asset/ndbroker/deposit/list',
      null,
      params,
    );
  }

  async getDepositDetail(params: GetDepositDetailDto): Promise<DepositDetail> {
    return this.makeRequest<DepositDetail>(
      'GET',
      '/api/v3/broker/nd/deposit/detail',
      null,
      params,
    );
  }

  async getWithdrawDetail(
    params: GetWithdrawDetailDto,
  ): Promise<WithdrawalDetail> {
    return this.makeRequest<WithdrawalDetail>(
      'GET',
      '/api/v3/broker/nd/withdraw/detail',
      null,
      params,
    );
  }

  async downloadBrokerRebate(params: RebateDownloadDto): Promise<string> {
    return this.makeRequest<string>(
      'GET',
      '/api/v1/broker/nd/rebate/download',
      null,
      params,
    );
  }

  async createTradingPair(data: CreateTradingPairDto): Promise<any> {
    const engineBaseUrl = this.configService.get<string>('ENGINE_BASE_URL') || 'https://engine.rvaexchange.net';
    const adminToken = this.configService.get<string>('ENGINE_ADMIN_TOKEN');

    if (!adminToken) {
      throw new Error('ENGINE_ADMIN_TOKEN is not configured');
    }

    try {
      const config: AxiosRequestConfig = {
        method: 'POST',
        url: `${engineBaseUrl}/api/v1/cex/admin/trading-pairs`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        data,
        timeout: 30000,
      };

      this.logger.debug(`Creating trading pair: ${data.symbol}`);

      const response = await firstValueFrom(
        this.httpService.request(config),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create trading pair: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
