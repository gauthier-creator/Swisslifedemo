import { Module, Global } from '@nestjs/common';
import { NotabeneService } from './notabene.service';

@Global()
@Module({
  providers: [NotabeneService],
  exports: [NotabeneService],
})
export class NotabeneModule {}
