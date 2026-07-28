import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator'

export class UpdateOnboardingDto {
  @IsInt()
  @Min(1)
  @Max(7)
  step: number

  @IsBoolean()
  @IsOptional()
  completed?: boolean
}
