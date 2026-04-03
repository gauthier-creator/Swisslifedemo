import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum, IsNumber, IsDateString, ValidateNested, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RiskProfile, SourceOfFunds } from '../../../database/entities';

class AddressDto {
  @ApiProperty() @IsString() street: string;
  @ApiProperty() @IsString() city: string;
  @ApiProperty() @IsString() postalCode: string;
  @ApiProperty() @IsString() @Length(2, 2) country: string;
}

export class CreateClientDto {
  @ApiProperty({ description: 'Salesforce Contact ID' })
  @IsString()
  salesforceContactId: string;

  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty() @IsDateString() dateOfBirth: string;
  @ApiProperty() @IsString() @Length(2, 2) nationality: string;
  @ApiProperty() @IsString() @Length(2, 2) taxResidency: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ enum: RiskProfile, default: RiskProfile.BALANCED })
  @IsOptional()
  @IsEnum(RiskProfile)
  riskProfile?: RiskProfile;

  @ApiProperty({ default: false }) @IsOptional() @IsBoolean() pepStatus?: boolean;

  @ApiProperty({ enum: SourceOfFunds })
  @IsOptional()
  @IsEnum(SourceOfFunds)
  sourceOfFunds?: SourceOfFunds;

  @ApiProperty({ required: false }) @IsOptional() @IsString() sourceOfCrypto?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() expectedAnnualVolumeEur?: number;
}
