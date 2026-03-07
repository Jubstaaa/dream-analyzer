/**
 * Token type enumeration
 * 0: Access - Access token for authenticated requests
 * 1: LoginVerify - Login verification token
 * 2: RegisterVerify - Registration verification token
 * 3: CreateProfile - Create profile token
 * 4: ForgotPasswordVerify - Forgot password verification token
 * 5: ResetPassword - Reset password token
 */
export enum TokenType {
  ACCESS = 0,
  LOGIN_VERIFY = 1,
  REGISTER_VERIFY = 2,
  CREATE_PROFILE = 3,
  FORGOT_PASSWORD_VERIFY = 4,
  RESET_PASSWORD = 5,
}

export const TOKEN_TYPE_VALUES = [0, 1, 2, 3, 4, 5] as const;
export type TokenTypeValue = (typeof TOKEN_TYPE_VALUES)[number];
