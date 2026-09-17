import { Module } from '@nestjs/common'
import { SettingsModule } from '@/modules/settings/settings.module'
import { ObjectEngineModule } from '@/shared/object-engine/object-engine.module'
import { ContactsController } from './controllers/contacts.controller'
import { ContactsService } from './services/contacts.service'
import { ContactMergeService } from './services/contact-merge.service'
import { ContactViewsController } from './controllers/contact-views.controller'
import { ContactWorkspaceController } from './controllers/contact-workspace.controller'
import { ContactWorkspaceService } from './services/contact-workspace.service'
import { ContactDuplicatesService } from './services/contact-duplicates.service'
import { ContactTaxonomyService } from './services/contact-taxonomy.service'
import { ContactStatsCacheService } from './services/contact-stats-cache.service'
import { ContactConsentsController } from './controllers/contact-consents.controller'
import { ContactConsentsService } from './services/contact-consents.service'
import { ContactConsentsRepository } from './repositories/contact-consents.repository'
import { ContactImportService } from './services/contact-import.service'
import { ContactsRepository } from './repositories/contacts.repository'
import { ContactDuplicatesRepository } from './repositories/contact-duplicates.repository'

@Module({
  imports: [SettingsModule, ObjectEngineModule],
  controllers: [
    ContactViewsController,
    ContactWorkspaceController,
    ContactConsentsController,
    ContactsController,
  ],
  providers: [
    ContactsService,
    ContactMergeService,
    ContactWorkspaceService,
    ContactDuplicatesService,
    ContactTaxonomyService,
    ContactStatsCacheService,
    ContactConsentsService,
    ContactImportService,
    ContactsRepository,
    ContactDuplicatesRepository,
    ContactConsentsRepository,
  ],
  exports: [ContactsService],
})
export class ContactsModule {}
