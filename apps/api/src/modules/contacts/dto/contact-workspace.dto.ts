import { IsObject, IsOptional, IsUUID, ValidateIf } from 'class-validator'

export class UpdateContactWorkspaceDto {
  @IsOptional()
  @ValidateIf((o: UpdateContactWorkspaceDto) => o.activeViewId !== null)
  @IsUUID()
  activeViewId?: string | null

  @IsOptional()
  @IsObject()
  tableState?: Record<string, unknown>
}
