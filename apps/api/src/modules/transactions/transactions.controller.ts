import {
  Controller, Get, Post, Param, Body, Query, Req,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { TransactionsService } from './transactions.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { RolesGuard, Role } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(ApiKeyGuard, RolesGuard)
@Controller('v1')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transactions/withdraw')
  @Roles(Role.ADVISOR, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate a crypto withdrawal (AML screening + approval flow)' })
  async createWithdrawal(@Body() dto: CreateWithdrawalDto, @Req() req: Request) {
    return this.transactionsService.createWithdrawal(dto, {
      requestId: (req as any).requestId,
      userId: (req as any).user?.id,
      userRole: (req as any).user?.role,
      ipAddress: req.ip || '',
    });
  }

  @Get('transactions/:txId')
  @Roles(Role.ADVISOR, Role.COMPLIANCE_OFFICER, Role.ADMIN, Role.READONLY)
  @ApiOperation({ summary: 'Get transaction details' })
  async findOne(@Param('txId') txId: string) {
    return this.transactionsService.findOne(txId);
  }

  @Get('clients/:clientId/transactions')
  @Roles(Role.ADVISOR, Role.COMPLIANCE_OFFICER, Role.ADMIN, Role.READONLY)
  @ApiOperation({ summary: 'Get client transaction history' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  async findByClient(
    @Param('clientId') clientId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.transactionsService.findByClient(clientId, page || 1, limit || 20);
  }

  @Get('transactions/:txId/travel-rule')
  @Roles(Role.COMPLIANCE_OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Get Travel Rule data for a transaction (TFR compliance)' })
  async getTravelRuleData(@Param('txId') txId: string) {
    return this.transactionsService.getTravelRuleData(txId);
  }

  @Post('transactions/:txId/approve')
  @Roles(Role.ADVISOR_MANAGER, Role.COMPLIANCE_OFFICER, Role.HEAD_OF_COMPLIANCE, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending transaction (TAP workflow)' })
  async approve(@Param('txId') txId: string, @Req() req: Request) {
    return this.transactionsService.approveTransaction(
      txId,
      (req as any).user?.id,
      (req as any).user?.role,
      {
        requestId: (req as any).requestId,
        userId: (req as any).user?.id,
        userRole: (req as any).user?.role,
        ipAddress: req.ip || '',
      },
    );
  }
}
