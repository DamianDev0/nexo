import { Injectable } from '@nestjs/common'
import { DEFAULT_CONTACT_TAXONOMY } from '@repo/shared-types'
import type {
  ContactTaxonomy,
  ContactWorkspace,
  FieldDef,
  TaxonomyOption,
} from '@repo/shared-types'
import { ObjectWorkspaceService } from '@/shared/object-engine/services/object-workspace.service'
import { CONTACT_OBJECT } from '../constants/contact-object.definition'
import { ContactsService } from './contacts.service'

function enabledKeys(options: TaxonomyOption[]): string[] {
  return options.filter((option) => option.enabled).map((option) => option.key)
}

@Injectable()
export class ContactWorkspaceService {
  constructor(
    private readonly workspace: ObjectWorkspaceService,
    private readonly contacts: ContactsService,
  ) {}

  async getWorkspace(
    schemaName: string,
    userId: string,
    taxonomy: ContactTaxonomy = DEFAULT_CONTACT_TAXONOMY,
    customFields: FieldDef[] = [],
  ): Promise<ContactWorkspace> {
    const [base, counts] = await Promise.all([
      this.workspace.getWorkspace(schemaName, CONTACT_OBJECT, userId, customFields),
      this.contacts.counts(schemaName, userId),
    ])

    return {
      ...base,
      quickFilters: {
        statuses: enabledKeys(taxonomy.statuses),
        sources: enabledKeys(taxonomy.sources),
        lifecycleStages: enabledKeys(taxonomy.lifecycleStages),
      },
      counts,
    }
  }
}
