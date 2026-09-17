import { request } from '@/shared/api/request'

import type { ObjectTableState, ObjectView, ObjectViewInput } from '@repo/shared-types'

export function objectViewsService(apiPath: string) {
  return {
    workspace: <TWorkspace>() =>
      request<TWorkspace>({ method: 'get', url: `${apiPath}/workspace` }),

    saveTableState: (tableState: ObjectTableState) =>
      request<void>({ method: 'patch', url: `${apiPath}/workspace`, data: { tableState } }),

    createView: (data: ObjectViewInput) =>
      request<ObjectView>({ method: 'post', url: `${apiPath}/views`, data }),

    updateView: (id: string, data: Partial<ObjectViewInput>) =>
      request<ObjectView>({ method: 'patch', url: `${apiPath}/views/${id}`, data }),

    deleteView: (id: string) => request<void>({ method: 'delete', url: `${apiPath}/views/${id}` }),

    reorderViews: (ids: ReadonlyArray<string>) =>
      request<void>({ method: 'patch', url: `${apiPath}/views/reorder`, data: { ids } }),

    duplicateView: (id: string) =>
      request<ObjectView>({ method: 'post', url: `${apiPath}/views/${id}/duplicate` }),
  }
}
