export function getStatusBadgeClass(status?: string) {
  if (!status) return 'status-badge status-badge--info';
  if (status === 'completed') return 'status-badge status-badge--success';
  if (status === 'declined' || status === 'cancelled') return 'status-badge status-badge--danger';
  if (status === 'in_progress' || status === 'accepted' || status === 'assigned' || status === 'confirmed') {
    return 'status-badge status-badge--warning';
  }
  return 'status-badge status-badge--info';
}

