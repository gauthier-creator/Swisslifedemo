import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
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

    // Database — supports Railway DATABASE_URL or individual vars
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const databaseUrl = process.env.DATABASE_URL;

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [Client, Wallet, Transaction, AuditLog, KycRecord, AmlAlert],
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV !== 'production',
            ssl: { rejectUnauthorized: false },
          };
        }

        return {
          type: 'postgres',
          host: String(config.get('database.host') || 'localhost'),
          port: Number(config.get('database.port') || 5432),
          database: String(config.get('database.name') || 'cryptovault'),
          username: String(config.get('database.user') || 'cryptovault'),
          password: String(config.get('database.password') || ''),
          entities: [Client, Wallet, Transaction, AuditLog, KycRecord, AmlAlert],
          synchronize: process.env.NODE_ENV !== 'production',
          logging: process.env.NODE_ENV !== 'production',
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
        };
      },
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
