import { apiPatch, apiPostForm } from '@/lib/api/http';
import type { AppMeDto } from '@/lib/api/dto/auth';

export type UpdateMeDto = {
  name?: string;
  city?: string;
  language?: string;
  phone?: string;
  bio?: string;
};

export function updateMe(payload: UpdateMeDto) {
  return apiPatch<UpdateMeDto, AppMeDto>('/users/me', payload);
}

export function uploadMyAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  return apiPostForm<AppMeDto>('/users/me/avatar', formData);
}
