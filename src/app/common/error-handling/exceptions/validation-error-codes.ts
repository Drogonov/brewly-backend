import { ValidationErrorKeys } from "src/app/common/localization/generated"
import { ErrorFieldCodeType } from "./error-fieldcodes"

export interface ValidationErrorCodes {
  errorFieldsCode: ErrorFieldCodeType
  validationErrorKey: ValidationErrorKeys
} 