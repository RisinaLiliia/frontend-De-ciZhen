import type { I18nKey } from '@/lib/i18n/keys';
import { ApiError } from '@/lib/api/http-error';

type Translate = (key: I18nKey) => string;

function toMessageText(error: ApiError): string {
  if (!error.data?.message) return error.message || '';
  return Array.isArray(error.data.message)
    ? error.data.message.join(' ')
    : error.data.message;
}

function getErrorCode(error: ApiError): string | null {
  const value = error.data?.errorCode;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function looksLikeEmailExists(message: string): boolean {
  return /(already|exists|existiert|bereits|taken|duplicate).*(email|e-mail)/i.test(message);
}

function looksLikeInvalidCredentials(message: string): boolean {
  return /(invalid|wrong|incorrect|ungültig|falsch).*(credential|login|password|passwort|email|e-mail)/i.test(message);
}

export function isInvalidCredentialsError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const code = getErrorCode(error);
  if (code === 'AUTH_INVALID_CREDENTIALS') return true;
  const message = toMessageText(error);
  return error.status === 401 || looksLikeInvalidCredentials(message);
}

export function isEmailExistsError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const code = getErrorCode(error);
  if (code === 'AUTH_EMAIL_EXISTS') return true;
  const message = toMessageText(error);
  return error.status === 409 || looksLikeEmailExists(message);
}

export function getLoginErrorMessage(error: unknown, t: Translate): string {
  if (isInvalidCredentialsError(error)) {
    return t('auth.errorInvalidCredentials');
  }

  return t('auth.errorGenericLogin');
}

export function getRegisterErrorMessage(error: unknown, t: Translate): string {
  if (isEmailExistsError(error)) {
    return t('auth.errorEmailExists');
  }

  return t('auth.errorGenericRegister');
}
