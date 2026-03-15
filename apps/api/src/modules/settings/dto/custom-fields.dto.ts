import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import type {
  CustomFieldType,
  SelectOption,
  FieldDef,
  FieldPermission,
  CustomFieldEntity,
} from '../interfaces/custom-field.interface'

const FIELD_TYPES: CustomFieldType[] = [
  'text',
  'textarea',
  'number',
  'currency',
  'date',
  'datetime',
  'select',
  'multiselect',
  'boolean',
  'url',
  'phone',
  'email',
  'file',
  'relation',
  'formula',
  'geolocation',
]

const PERMISSION_LEVELS = ['all', 'manager_plus', 'admin_plus', 'owner_only', 'none'] as const
const ENTITIES: CustomFieldEntity[] = ['contacts', 'companies', 'deals']

export class SelectOptionDto implements SelectOption {
  @IsString() value: string
  @IsString() label: string
  @IsOptional() @IsString() color?: string
}

export class FieldDefDto implements FieldDef {
  @ApiProperty() @IsString() key: string
  @ApiProperty() @IsString() label: string
  @ApiProperty({ enum: FIELD_TYPES }) @IsIn(FIELD_TYPES) type: CustomFieldType
  @ApiProperty() @IsBoolean() required: boolean
  @ApiProperty() @IsBoolean() unique: boolean
  @ApiProperty() @IsInt() @Min(1) order: number
  @ApiPropertyOptional() @IsOptional() defaultValue?: unknown
  @ApiPropertyOptional() @IsOptional() @IsString() placeholder?: string
  @ApiPropertyOptional({ type: [SelectOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectOptionDto)
  options?: SelectOptionDto[]
  @ApiPropertyOptional() @IsOptional() min?: number
  @ApiPropertyOptional() @IsOptional() max?: number
  @ApiPropertyOptional() @IsOptional() @IsString() formula?: string
  @ApiPropertyOptional({ enum: ENTITIES })
  @IsOptional()
  @IsIn(ENTITIES)
  relationEntity?: CustomFieldEntity
}

export class UpdateCustomFieldsDto {
  @ApiProperty({ type: [FieldDefDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDefDto)
  fields: FieldDefDto[]
}

export class FieldPermissionDto implements FieldPermission {
  @IsIn(PERMISSION_LEVELS) visibility: FieldPermission['visibility']
  @IsIn(PERMISSION_LEVELS) editable: FieldPermission['editable']
}

export class UpdateFieldPermissionsDto {
  @ApiProperty({ description: 'Map of fieldKey to permission definition' })
  permissions: Record<string, FieldPermissionDto>
}
