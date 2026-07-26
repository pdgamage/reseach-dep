import React from 'react';
import { ClockIcon } from 'lucide-react';
interface CountdownBadgeProps {
  closingDate: string;
}
export function CountdownBadge({ closingDate }: CountdownBadgeProps) {
  const calculateDaysLeft = () => {
    const today = new Date();
    const closing = new Date(closingDate);
    const diffTime = closing.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const daysLeft = calculateDaysLeft();
  const isClosed = daysLeft < 0;
  if (isClosed) {
    return (
      <div className="inline-flex items-center text-sm text-rose-600 font-medium bg-rose-50 px-3 py-1 rounded-full">
        <ClockIcon className="w-4 h-4 mr-1.5" />
        Applications Closed
      </div>);

  }
  return (
    <div
      className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full ${daysLeft <= 3 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
      
      <ClockIcon className="w-4 h-4 mr-1.5" />
      {daysLeft === 0 ? 'Closes today' : `Closes in ${daysLeft} days`}
    </div>);

}