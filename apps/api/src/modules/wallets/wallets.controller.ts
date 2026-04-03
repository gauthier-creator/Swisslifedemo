import {
  Controller, Get, Post, Param, Body, Req,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { RolesGuard, Role } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Wallets')
@ApiBearerAuth()
@UseGuards(ApiKeyGuard, RolesGuard)
@Controller('v1')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('clients/:clientId/wallets')
  @Roles(Role.ADVISOR, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a wallet for a client (segregated vault on custodian)' })
  async create(
    @Param('clientId') clientId: string,
    @Body() dto: CreateWalletDto,
    @Req() req: Request,
  ) {
    return this.walletsService.create(clientId, dto, {
      requestId: (req as any).requestId,
      userId: (req as any).user?.id,
      userRole: (req as any).user?.role,
      ipAddress: req.ip || '',
    });
  }

  @Get('clients/:clientId/wallets')
  @Roles(Role.ADVISOR, Role.COMPLIANCE_OFFICER, Role.ADMIN, Role.READONLY)
  @ApiOperation({ summary: 'List wallets for a client' })
  async findByClient(@Param('clientId') clientId: string) {
    return this.walletsService.findByClient(clientId);
  }

  @Get('wallets/:walletId')
  @Roles(Role.ADVISOR, Role.COMPLIANCE_OFFICER, Role.ADMIN, Role.READONLY)
  @ApiOperation({ summary: 'Get wallet details' })
  async findOne(@Param('walletId') walletId: string) {
    return this.walletsService.findOne(walletId);
  }

  @Get('wallets/:walletId/balance')
  @Roles(Role.ADVISOR, Role.COMPLIANCE_OFFICER, Role.ADMIN, Role.READONLY)
  @ApiOperation({ summary: 'Get real-time wallet balance from custodian' })
  async getBalance(@Param('walletId') walletId: string) {
    return this.walletsService.getBalance(walletId);
  }

  @Get('wallets/:walletId/address')
  @Roles(Role.ADVISOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get deposit address for a wallet' })
  async getDepositAddress(@Param('walletId') walletId: string) {
    return this.walletsService.getDepositAddress(walletId);
  }
}
