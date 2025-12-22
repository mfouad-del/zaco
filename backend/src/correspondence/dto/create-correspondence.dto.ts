import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DocType {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

export enum Priority {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  IMMEDIATE = 'IMMEDIATE',
}

export enum SecurityLevel {
  PUBLIC = 'PUBLIC',
  CONFIDENTIAL = 'CONFIDENTIAL',
  TOP_SECRET = 'TOP_SECRET',
}

export class CreateCorrespondenceDto {
  @ApiProperty({ enum: DocType })
  @IsEnum(DocType)
  type: DocType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceNum?: string;

  @ApiProperty()
  @IsDateString()
  docDate: string;

  @ApiProperty({ enum: Priority })
  @IsEnum(Priority)
  priority: Priority;

  @ApiProperty({ enum: SecurityLevel })
  @IsEnum(SecurityLevel)
  securityLevel: SecurityLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
  
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  physicalLocation?: string;
}
