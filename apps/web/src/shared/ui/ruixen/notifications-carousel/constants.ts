export const ROW_HEIGHT = 68
export const ROW_GAP = 6
export const ROW_STEP = ROW_HEIGHT + ROW_GAP
export const VISIBLE_ROWS = 5
export const VIEWPORT_HEIGHT = ROW_STEP * VISIBLE_ROWS
export const FALLOFF_ROWS = 3
export const WHEEL_THRESHOLD = 45
export const DRAG_STEP_THRESHOLD = 20
export const DISMISS_THRESHOLD = 80
export const ZONE_MAX_OPACITY = 0.18

export const ROW_SPRING = { type: 'spring', stiffness: 400, damping: 32 } as const
export const SNAP_SPRING = { type: 'spring', stiffness: 500, damping: 30 } as const
export const FLING_SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const
export const FLING_DISTANCE = 400
