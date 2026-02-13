// src/lib/api/contracts.ts
import { apiGet, apiPost } from '@/lib/api/http';
import type { CancelContractDto, ConfirmContractDto, ContractDto } from '@/lib/api/dto/contracts';

const toQuery = (params: Record<string, string | undefined>) => {
  const parts = Object.entries(params)
    .filter(([, v]) => v && String(v).length > 0)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

export async function listMyContracts(params?: { role?: 'client' | 'provider' | 'all'; status?: string }) {
  const q = toQuery({ role: params?.role, status: params?.status });
  return apiGet<ContractDto[]>(`/contracts/my${q}`);
}

export async function getContract(id: string) {
  return apiGet<ContractDto>(`/contracts/${id}`);
}

export async function confirmContract(id: string, payload: ConfirmContractDto) {
  return apiPost<ConfirmContractDto, ContractDto>(`/contracts/${id}/confirm`, payload);
}

export async function cancelContract(id: string, payload?: CancelContractDto) {
  return apiPost<CancelContractDto, ContractDto>(`/contracts/${id}/cancel`, payload ?? {});
}

export async function completeContract(id: string) {
  return apiPost<void, ContractDto>(`/contracts/${id}/complete`, undefined);
}
