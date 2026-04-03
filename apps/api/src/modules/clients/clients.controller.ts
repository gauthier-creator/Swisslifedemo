import {
  Controller, Get, Post, Patch, Param, Body, Query, Req,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { RolesGuard, Role } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(ApiKeyGuard, RolesGuard)
@Controller('v1/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(Role.ADVISOR, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new client (onboarding)' })
  async create(@Body() dto: CreateClientDto, @Req() req: Request) {
    return this.clientsService.create(dto, {
      requestId: (req as any).requestId,
      userId: (req as any).user?.id,
      userRole: (req as any).user?.role,
      ipAddress: req.ip || '',
    });
  }

  @Get()
  @Roles(Role.ADVISOR, Role.COMPLIANCE_OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'List all clients' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.clientsService.findAll(page || 1, limit || 20);
  }

  @Get(':id')
  @Roles(Role.ADVISOR, Role.COMPLIANCE_OFFICER, Role.ADMIN, Role.READONLY)
  @ApiOperation({ summary: 'Get client details' })
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADVISOR, Role.ADMIN)
  @ApiOperation({ summary: 'Update client info' })
  async update(@Param('id') id: string, @Body() dto: UpdateClientDto, @Req() req: Request) {
    return this.clientsService.update(id, dto, {
      requestId: (req as any).requestId,
      userId: (req as any).user?.id,
      userRole: (req as any).user?.role,
      ipAddress: req.ip || '',
    });
  }

  @Get(':id/kyc-status')
  @Roles(Role.ADVISOR, Role.COMPLIANCE_OFFICER, Role.ADMIN, Role.READONLY)
  @ApiOperation({ summary: 'Get KYC verification status' })
  async getKycStatus(@Param('id') id: string) {
    return this.clientsService.getKycStatus(id);
  }

  @Post(':id/kyc/initiate')
  @Roles(Role.ADVISOR, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate KYC verification for client' })
  async initiateKyc(@Param('id') id: string, @Req() req: Request) {
    return this.clientsService.initiateKyc(id, {
      requestId: (req as any).requestId,
      userId: (req as any).user?.id,
      userRole: (req as any).user?.role,
      ipAddress: req.ip || '',
    });
  }
}
