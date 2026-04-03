import { Module, Global } from '@nestjs/common';
import { SumsubService } from './sumsub.service';

@Global()
@Module({
  providers: [SumsubService],
  exports: [SumsubService],
})
export class SumsubModule {}
