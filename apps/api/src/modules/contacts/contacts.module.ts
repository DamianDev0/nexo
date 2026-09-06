import { Module } from '@nestjs/common'
import { SettingsModule } from '@/modules/settings/settings.module'
import { ContactsController } from './controllers/contacts.controller'
import { ContactsService } from './services/contacts.service'
import { ContactViewsController } from './controllers/contact-views.controller'
import { ContactViewsService } from './services/contact-views.service'
import { ContactWorkspaceController } from './controllers/contact-workspace.controller'
import { ContactWorkspaceService } from './services/contact-workspace.service'
import { ContactDuplicatesService } from './services/contact-duplicates.service'
import { ContactConsentsController } from './controllers/contact-consents.controller'
import { ContactConsentsService } from './services/contact-consents.service'
import { ContactConsentsRepository } from './repositories/contact-consents.repository'
import { ContactImportService } from './services/contact-import.service'
import { ContactsRepository } from './repositories/contacts.repository'
import { ContactViewsRepository } from './repositories/contact-views.repository'
import { ContactWorkspaceRepository } from './repositories/contact-workspace.repository'
import { ContactDuplicatesRepository } from './repositories/contact-duplicates.repository'

@Module({
  imports: [SettingsModule],
  controllers: [
    ContactViewsController,
    ContactWorkspaceController,
    ContactConsentsController,
    ContactsController,
  ],
  providers: [
    ContactsService,
    ContactViewsService,
    ContactWorkspaceService,
    ContactDuplicatesService,
    ContactConsentsService,
    ContactImportService,
    ContactsRepository,
    ContactViewsRepository,
    ContactWorkspaceRepository,
    ContactDuplicatesRepository,
    ContactConsentsRepository,
  ],
  exports: [ContactsService],
})
export class ContactsModule {}
