import React from 'react';
import { JobStatus } from '../data/mockData';
interface StatusBadgeProps {
  status: JobStatus;
}
export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Closed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      
      {status}
    </span>);

}