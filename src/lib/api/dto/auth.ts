// src/lib/api/dto/auth.ts
export type UserRole = 'client' | 'provider' | 'admin';
export type UserMode = 'client' | 'provider';

export type SafeUserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string;
  language?: string;
  createdAt?: string;
};

export type AvatarDto = {
  url: string;
  isDefault: boolean;
};

export type MeResponseDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string;
  language?: string;
  phone?: string;
  bio?: string;
  avatar?: AvatarDto;
  acceptedPrivacyPolicy: boolean;
  acceptedPrivacyPolicyAt?: string | null;
  acceptedPrivacyPolicyVersion?: string | null;
  isBlocked: boolean;
  blockedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CapabilitiesDto = {
  canProvide?: boolean;
};

export type ProfileRefDto = {
  id?: string;
  status?: string;
};

export type AppMeDto = MeResponseDto & {
  capabilities?: CapabilitiesDto | null;
  lastMode?: UserMode | null;
  providerProfile?: ProfileRefDto | null;
  clientProfile?: ProfileRefDto | null;
};

export type AuthResponseDto = {
  user: SafeUserDto;
  accessToken: string;
  expiresIn: number;
};

export type RefreshResponseDto = {
  accessToken: string;
  expiresIn: number;
};

export type LogoutResponseDto = {
  ok: boolean;
};

export type RegisterDto = {
  name: string;
  email: string;
  password: string;
  city?: string;
  language?: string;
  role?: 'client' | 'provider';
  acceptPrivacyPolicy: boolean;
};

export type OauthCompleteRegisterDto = {
  signupToken: string;
  acceptPrivacyPolicy: boolean;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type ForgotPasswordDto = {
  email: string;
  nextPath?: string;
};

export type ForgotPasswordResponseDto = {
  ok: boolean;
  resetUrl?: string;
};

export type ResetPasswordDto = {
  token: string;
  password: string;
};
