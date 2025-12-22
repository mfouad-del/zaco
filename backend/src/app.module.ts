import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CorrespondenceModule } from './correspondence/correspondence.module';
import { CompanyModule } from './company/company.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CorrespondenceModule,
    CompanyModule,
    AuditLogModule,
    StatsModule,
  ],
})
export class AppModule {}
