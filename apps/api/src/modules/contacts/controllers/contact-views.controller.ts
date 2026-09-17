import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ObjectViewsController } from '@/shared/object-engine/controllers/object-views.controller'
import { ObjectViewsService } from '@/shared/object-engine/services/object-views.service'
import { CONTACT_OBJECT } from '../constants/contact-object.definition'

@ApiTags('Contact Views')
@Controller('contacts/views')
export class ContactViewsController extends ObjectViewsController {
  protected readonly definition = CONTACT_OBJECT

  constructor(views: ObjectViewsService) {
    super(views)
  }
}
