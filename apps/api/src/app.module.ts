import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';

// Entities
import {
  Client, Wallet, Transaction, AuditLog, KycRecord, AmlAlert,
} from './database/entities';

// Common
import { AuditModule } from './common/audit/audit.module';

// Integrations
import { TaurusModule } from './integrations/taurus/taurus.module';
import { ChainanalysisModule } from './integrations/chainalysis/chainalysis.module';
import { SumsubModule } from './integrations/sumsub/sumsub.module';
import { NotabeneModule } from './integrations/notabene/notabene.module';

// Feature Modules
import { ClientsModule } from './modules/clients/clients.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        database: config.get('database.name'),
        username: config.get('database.user'),
        password: config.get('database.password'),
        entities: [Client, Wallet, Transaction, AuditLog, KycRecord, AmlAlert],
        synchronize: process.env.NODE_ENV !== 'production', // Use migrations in prod
        logging: process.env.NODE_ENV !== 'production',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
      }),
    }),

    // Common
    AuditModule,

    // Integrations (Global)
    TaurusModule,
    ChainanalysisModule,
    SumsubModule,
    NotabeneModule,

    // Feature Modules
    ClientsModule,
    WalletsModule,
    TransactionsModule,
    ReportingModule,
    HealthModule,
  ],
})
export class AppModule {}
