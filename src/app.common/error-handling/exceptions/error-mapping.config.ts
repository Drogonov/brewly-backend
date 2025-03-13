import { ErrorSubCode, ErrorSubCodeType } from "./error-subcodes";

export const constraintToErrorMapping: Record<string, ErrorSubCodeType> = {
    isEmail: ErrorSubCode.INCORRECT_EMAIL,
    minLength: ErrorSubCode.INCORRECT_PASSWORD,
    // add more mappings as needed
  };