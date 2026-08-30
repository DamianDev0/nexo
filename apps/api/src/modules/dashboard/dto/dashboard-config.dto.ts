import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class ToggleWidgetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  widgetId: string

  @IsBoolean()
  visible: boolean
}

export class ReorderWidgetsDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  widgetIds: string[]
}
