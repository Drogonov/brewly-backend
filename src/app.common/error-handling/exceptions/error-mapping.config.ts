import { ValidationErrorKeys } from "src/app.common/localization/generated";
import { ErrorFieldCodeType } from "./error-fieldcodes";

export const constraintToErrorMapping: Record<ErrorFieldCodeType, Record<string, ValidationErrorKeys>> = {
  email: {
    isEmail: ValidationErrorKeys.INCORRECT_EMAIL,
  },
  password: {
    minLength: ValidationErrorKeys.PASSWORD_IS_SHORT,
  },
};