import { JobStatus } from '../data/mockData';

interface StatusBadgeProps {
  status: JobStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Status badge hidden per user preference
  return null;
}