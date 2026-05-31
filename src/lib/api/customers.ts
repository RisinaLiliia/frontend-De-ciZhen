import { apiGet } from '@/lib/api/http';
import type { CustomerPublicDto } from '@/lib/api/dto/customers';

export async function getPublicCustomerById(id: string) {
  const targetId = String(id ?? '').trim();
  if (!targetId) throw new Error('customer id is required');
  return apiGet<CustomerPublicDto>(`/customers/${encodeURIComponent(targetId)}`);
}
