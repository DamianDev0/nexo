export type Municipality = {
  code: string
  name: string
  departmentCode: string
  department: string
}

export type Department = {
  code: string
  name: string
}

export type NITResult = {
  isValid: boolean
  nit?: string
  checkDigit?: string
  formatted?: string
}
