import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CryptoAsset } from '../../../database/entities';

export class CreateWalletDto {
  @ApiProperty({ enum: CryptoAsset })
  @IsEnum(CryptoAsset)
  asset: CryptoAsset;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label?: string;
}
