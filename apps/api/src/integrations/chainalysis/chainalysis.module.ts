import { Module, Global } from '@nestjs/common';
import { ChainanalysisService } from './chainalysis.service';

@Global()
@Module({
  providers: [ChainanalysisService],
  exports: [ChainanalysisService],
})
export class ChainanalysisModule {}
