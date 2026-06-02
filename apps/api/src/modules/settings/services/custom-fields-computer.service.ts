import { Injectable } from '@nestjs/common'
import type { CustomFieldEntity, FieldDef } from '@repo/shared-types'
import { evaluateFormula } from '@/shared/formula/formula.util'
import { TenantConfigService } from './tenant-config.service'

function numericValuesOf(values: Record<string, unknown>): Record<string, number> {
  const numeric: Record<string, number> = {}
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'number' && Number.isFinite(value)) numeric[key] = value
  }
  return numeric
}

export function computeFormulaFields(
  values: Record<string, unknown>,
  defs: FieldDef[],
): Record<string, unknown> {
  const formulas = defs.filter((d) => d.type === 'formula' && d.formula)
  if (formulas.length === 0) return values

  const numeric = numericValuesOf(values)
  const result = { ...values }
  for (const def of formulas) {
    result[def.key] = evaluateFormula(def.formula ?? '', numeric)
  }
  return result
}

@Injectable()
export class CustomFieldsComputer {
  constructor(private readonly config: TenantConfigService) {}

  async compute(
    tenantId: string,
    entity: CustomFieldEntity,
    values: Record<string, unknown> | undefined,
  ): Promise<Record<string, unknown>> {
    const defs = (await this.config.getCustomFields(tenantId))[entity]
    return computeFormulaFields(values ?? {}, defs)
  }
}
