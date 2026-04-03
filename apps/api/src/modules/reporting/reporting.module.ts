import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client, Wallet, Transaction, AmlAlert } from '../../database/entities';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Wallet, Transaction, AmlAlert])],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}
