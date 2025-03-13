export const ErrorFieldCode = {
    email: 'email',
    password: 'password'
  } as const;
  
export type ErrorFieldCodeType = typeof ErrorFieldCode[keyof typeof ErrorFieldCode];