import { IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CryptoAsset } from '../../../database/entities';

class BeneficiaryDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: ['casp', 'self_hosted'] }) @IsString() accountType: 'casp' | 'self_hosted';
  @ApiProperty({ required: false }) @IsOptional() @IsString() vaspName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() vaspLei?: string;
}

class InitiatorDto {
  @ApiProperty() @IsString() salesforceUserId: string;
  @ApiProperty() @IsString() role: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() ipAddress?: string;
}

export class CreateWithdrawalDto {
  @ApiProperty() @IsString() walletId: string;
  @ApiProperty() @IsString() destinationAddress: string;
  @ApiProperty() @IsString() amount: string;
  @ApiProperty({ enum: CryptoAsset }) @IsEnum(CryptoAsset) asset: CryptoAsset;

  @ApiProperty({ type: BeneficiaryDto })
  @ValidateNested() @Type(() => BeneficiaryDto)
  beneficiary: BeneficiaryDto;

  @ApiProperty({ type: InitiatorDto })
  @ValidateNested() @Type(() => InitiatorDto)
  initiatedBy: InitiatorDto;

  @ApiProperty({ required: false }) @IsOptional() @IsString() memo?: string;
}
