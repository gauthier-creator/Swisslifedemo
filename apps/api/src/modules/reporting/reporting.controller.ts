import {
  Controller, Get, Param, Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { RolesGuard, Role } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Reporting')
@ApiBearerAuth()
@UseGuards(ApiKeyGuard, RolesGuard)
@Controller('v1')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('clients/:clientId/statement')
  @Roles(Role.ADVISOR, Role.COMPLIANCE_OFFICER, Role.ADMIN, Role.READONLY)
  @ApiOperation({ summary: 'Generate client statement (MiCA Art. 75 compliant)' })
  @ApiQuery({ name: 'period', required: false })
  async getClientStatement(
    @Param('clientId') clientId: string,
    @Query('period') period?: string,
  ) {
    return this.reportingService.generateClientStatement(clientId, period);
  }

  @Get('reports/auc')
  @Roles(Role.ADVISOR_MANAGER, Role.COMPLIANCE_OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Get global Assets under Custody report' })
  async getAucReport() {
    return this.reportingService.getAucReport();
  }

  @Get('reports/aml-alerts')
  @Roles(Role.COMPLIANCE_OFFICER, Role.HEAD_OF_COMPLIANCE, Role.ADMIN)
  @ApiOperation({ summary: 'Get AML alerts for compliance review' })
  @ApiQuery({ name: 'status', required: false })
  async getAmlAlerts(@Query('status') status?: string) {
    return this.reportingService.getAmlAlerts(status);
  }

  @Get('reports/segregation')
  @Roles(Role.COMPLIANCE_OFFICER, Role.HEAD_OF_COMPLIANCE, Role.ADMIN)
  @ApiOperation({ summary: 'Get asset segregation proof report (MiCA compliance)' })
  async getSegregationReport() {
    return this.reportingService.getSegregationReport();
  }
}
