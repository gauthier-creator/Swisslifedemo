import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../../database/entities';

export interface AuditContext {
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    action: AuditAction,
    context: AuditContext,
    options?: {
      entityType?: string;
      entityId?: string;
      metadata?: Record<string, unknown>;
      previousState?: Record<string, unknown>;
      newState?: Record<string, unknown>;
    },
  ): Promise<AuditLog> {
    const entry = this.auditLogRepository.create({
      action,
      entityType: options?.entityType,
      entityId: options?.entityId,
      userId: context.userId,
      userRole: context.userRole,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
      metadata: options?.metadata,
      previousState: options?.previousState,
      newState: options?.newState,
    });

    return this.auditLogRepository.save(entry);
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string, limit = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByAction(action: AuditAction, limit = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
