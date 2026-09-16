export const EDITABLE_CELL_TRIGGER =
  "group/cell static flex h-auto w-full min-w-0 items-center justify-between gap-1.5 rounded-none border-0 bg-transparent p-0 text-left text-sm font-normal shadow-none outline-none before:absolute before:inset-0 before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:border after:border-transparent after:transition-[border-color,background-color] after:duration-120 after:content-[''] hover:bg-transparent hover:after:border-ring hover:after:bg-accent/40 focus-visible:ring-0 focus-visible:after:border-ring focus-visible:after:bg-accent/40 data-[state=open]:after:border-ring data-[state=open]:after:bg-accent/40"

export const EDITABLE_CELL_ICON =
  'relative size-3.5 shrink-0 text-primary-deep opacity-0 transition-opacity duration-120 dark:text-primary group-hover/cell:opacity-100 group-focus-visible/cell:opacity-100 group-data-[state=open]/cell:opacity-100'

export const EDITABLE_CELL_CARET = `${EDITABLE_CELL_ICON} transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform group-data-[state=open]/cell:rotate-180`
