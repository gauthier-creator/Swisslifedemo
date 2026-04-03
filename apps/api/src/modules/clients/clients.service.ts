import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, ClientStatus } from '../../database/entities';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AuditService, AuditContext } from '../../common/audit/audit.service';
import { AuditAction } from '../../database/entities';
import { SumsubService } from '../../integrations/sumsub/sumsub.service';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly auditService: AuditService,
    private readonly sumsubService: SumsubService,
  ) {}

  async create(dto: CreateClientDto, auditCtx: AuditContext): Promise<Client> {
    const existing = await this.clientRepository.findOne({
      where: { salesforceContactId: dto.salesforceContactId },
    });
    if (existing) {
      throw new ConflictException(`Client with Salesforce ID ${dto.salesforceContactId} already exists`);
    }

    const client = this.clientRepository.create({
      ...dto,
      status: ClientStatus.PENDING_KYC,
    });

    const saved = await this.clientRepository.save(client);

    await this.auditService.log(AuditAction.CLIENT_CREATED, auditCtx, {
      entityType: 'client',
      entityId: saved.id,
      newState: { salesforceContactId: dto.salesforceContactId, email: dto.email },
    });

    this.logger.log(`Client created: ${saved.id} (SF: ${dto.salesforceContactId})`);
    return saved;
  }

  async findAll(page = 1, limit = 20): Promise<{ data: Client[]; total: number }> {
    const [data, total] = await this.clientRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async findBySalesforceId(sfId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { salesforceContactId: sfId } });
    if (!client) throw new NotFoundException(`Client with Salesforce ID ${sfId} not found`);
    return client;
  }

  async update(id: string, dto: UpdateClientDto, auditCtx: AuditContext): Promise<Client> {
    const client = await this.findOne(id);
    const previousState = { ...client };
    Object.assign(client, dto);
    const updated = await this.clientRepository.save(client);

    await this.auditService.log(AuditAction.CLIENT_UPDATED, auditCtx, {
      entityType: 'client',
      entityId: id,
      previousState: { email: previousState.email, status: previousState.status },
      newState: { email: updated.email, status: updated.status },
    });

    return updated;
  }

  async getKycStatus(id: string): Promise<{ status: string; kycUrl?: string }> {
    const client = await this.findOne(id);
    return {
      status: client.status,
      kycUrl: client.kycVerificationUrl || undefined,
    };
  }

  async initiateKyc(id: string, auditCtx: AuditContext): Promise<{ kycUrl: string }> {
    const client = await this.findOne(id);

    const applicantId = await this.sumsubService.createApplicant({
      externalUserId: client.id,
      email: client.email,
      phone: client.phone || undefined,
      firstName: client.firstName,
      lastName: client.lastName,
      dateOfBirth: client.dateOfBirth.toString(),
      country: client.nationality,
    });

    const accessToken = await this.sumsubService.generateAccessToken(applicantId, client.id);
    const kycUrl = `https://api.sumsub.com/idensic/l/#/access-token=${accessToken}`;

    client.kycExternalId = applicantId;
    client.kycVerificationUrl = kycUrl;
    client.status = ClientStatus.KYC_IN_PROGRESS;
    await this.clientRepository.save(client);

    await this.auditService.log(AuditAction.CLIENT_KYC_INITIATED, auditCtx, {
      entityType: 'client',
      entityId: id,
      metadata: { applicantId },
    });

    return { kycUrl };
  }
}
