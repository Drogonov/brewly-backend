import { ErrorFieldCodeType } from "./error-fieldcodes"
import { ErrorSubCodeType } from "./error-subcodes"

export interface ValidationErrorCodes {
  errorSubCode: ErrorSubCodeType
  errorFieldsCode: ErrorFieldCodeType
} 