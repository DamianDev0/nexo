import { Module } from '@nestjs/common'
import { SettingsModule } from '@/modules/settings/settings.module'
import { ContactsController } from './controllers/contacts.controller'
import { ContactsService } from './services/contacts.service'
import { ContactViewsController } from './controllers/contact-views.controller'
import { ContactViewsService } from './services/contact-views.service'

@Module({
  imports: [SettingsModule],
  controllers: [ContactViewsController, ContactsController],
  providers: [ContactsService, ContactViewsService],
  exports: [ContactsService],
})
export class ContactsModule {}
