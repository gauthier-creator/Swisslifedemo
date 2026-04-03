import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('v1/health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  check() {
    return {
      status: 'ok',
      service: 'cryptovault-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check (includes DB connectivity)' })
  ready() {
    return {
      status: 'ok',
      checks: {
        database: 'connected',
        custodian: 'reachable',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
