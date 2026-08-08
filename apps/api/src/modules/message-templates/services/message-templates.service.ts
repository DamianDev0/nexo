import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import type { Queue } from 'bullmq'
import Handlebars from 'handlebars'
import type {
  MessageTemplate,
  PaginatedTemplates,
  SendMessageResult,
  TemplateFormat,
  TemplatePreview,
} from '@repo/shared-types'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'
import { DEFAULT_PAGE_SIZE } from '@repo/shared-utils'
import type { MessageJobData } from '../message-queue.processor'
import { MessageTemplatesRepository } from '../repositories/message-templates.repository'
import { mapTemplate } from '../mappers/message-template.mapper'

@Injectable()
export class MessageTemplatesService {
  constructor(
    private readonly repository: MessageTemplatesRepository,
    @InjectQueue(QUEUE_NAMES.MESSAGES) private readonly messageQueue: Queue<MessageJobData>,
  ) {}

  async findAll(
    schemaName: string,
    channel?: string,
    category?: string,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedTemplates> {
    const { rows, total } = await this.repository.findAll(schemaName, {
      channel,
      category,
      limit,
      offset: (page - 1) * limit,
    })

    return { data: rows.map((r) => mapTemplate(r)), total, page, limit }
  }

  async findOne(schemaName: string, templateId: string): Promise<MessageTemplate> {
    const row = await this.repository.findById(schemaName, templateId)
    if (!row) throw new NotFoundException(`Template ${templateId} not found`)
    return mapTemplate(row)
  }

  async create(
    schemaName: string,
    data: {
      name: string
      channel: string
      format?: string
      subject?: string
      body: string
      variables?: string[]
      category?: string
    },
    userId: string,
  ): Promise<MessageTemplate> {
    const detectedVars = data.variables ?? this.extractVariables(data.body, data.subject)

    const row = await this.repository.insert(schemaName, {
      name: data.name,
      channel: data.channel,
      format: data.format ?? 'handlebars',
      subject: data.subject ?? null,
      body: data.body,
      variables: detectedVars,
      category: data.category ?? null,
      createdBy: userId,
    })
    return mapTemplate(row)
  }

  async update(
    schemaName: string,
    templateId: string,
    data: Partial<{
      name: string
      subject: string
      body: string
      format: string
      variables: string[]
      category: string
    }>,
  ): Promise<MessageTemplate> {
    const detectedVariables =
      data.body && !data.variables ? this.extractVariables(data.body, data.subject) : undefined

    const row = await this.repository.update(schemaName, templateId, data, detectedVariables)
    if (!row) throw new NotFoundException(`Template ${templateId} not found`)
    return mapTemplate(row)
  }

  async remove(schemaName: string, templateId: string): Promise<void> {
    const removed = await this.repository.softDelete(schemaName, templateId)
    if (removed === 0) throw new NotFoundException(`Template ${templateId} not found`)
  }

  async preview(
    schemaName: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<TemplatePreview> {
    const template = await this.findOne(schemaName, templateId)
    const rendered = this.render(template.body, template.format, variables)
    const subject = template.subject ? this.render(template.subject, 'text', variables) : null

    return {
      subject,
      body: template.body,
      renderedHtml: rendered,
    }
  }

  async send(
    schemaName: string,
    templateId: string,
    recipients: string[],
    variables: Record<string, string>,
    tenantId?: string,
  ): Promise<SendMessageResult> {
    const template = await this.findOne(schemaName, templateId)
    const renderedBody = this.render(template.body, template.format, variables)
    const renderedSubject = template.subject
      ? this.render(template.subject, 'text', variables)
      : null

    const jobs = recipients.map((recipient) => ({
      name: `send-${template.channel}`,
      data: {
        schemaName,
        tenantId: tenantId ?? '',
        templateId,
        channel: template.channel,
        recipient,
        subject: renderedSubject,
        renderedBody,
        variables,
      } satisfies MessageJobData,
    }))

    await this.messageQueue.addBulk(jobs)

    return {
      queued: recipients.length,
      templateName: template.name,
      channel: template.channel,
    }
  }

  async duplicate(
    schemaName: string,
    templateId: string,
    userId: string,
  ): Promise<MessageTemplate> {
    const source = await this.findOne(schemaName, templateId)

    const row = await this.repository.insert(schemaName, {
      name: `${source.name} (copy)`,
      channel: source.channel,
      format: source.format,
      subject: source.subject,
      body: source.body,
      variables: source.variables,
      category: source.category,
      createdBy: userId,
    })
    return mapTemplate(row)
  }

  private render(
    text: string,
    format: TemplateFormat | string,
    variables: Record<string, string>,
  ): string {
    if (format === 'handlebars' || format === 'html') {
      const compiled = Handlebars.compile(text)
      return compiled(variables)
    }
    return text.replaceAll(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? `{{${key}}}`)
  }

  private extractVariables(body: string, subject?: string | null): string[] {
    const text = `${subject ?? ''} ${body}`
    const matches = text.matchAll(/\{\{(\w+)\}\}/g)
    return [...new Set([...matches].map((m) => m[1]!))]
  }
}
