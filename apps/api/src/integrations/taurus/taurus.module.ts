import { Module, Global } from '@nestjs/common';
import { TaurusService } from './taurus.service';

@Global()
@Module({
  providers: [TaurusService],
  exports: [TaurusService],
})
export class TaurusModule {}
