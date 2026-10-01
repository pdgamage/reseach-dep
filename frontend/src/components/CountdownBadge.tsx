import { ClockIcon } from 'lucide-react';

interface CountdownBadgeProps {
  closingDate: string;
}

export function CountdownBadge({ closingDate }: CountdownBadgeProps) {
  const today = new Date();
  const closing = new Date(closingDate);
  const diffTime = closing.getTime() - today.getTime();

  const isClosed = diffTime < 0;

  if (isClosed) {
    return (
      <div className="inline-flex items-center text-sm text-rose-600 font-medium bg-rose-50 px-3 py-1 rounded-full">
        <ClockIcon className="w-4 h-4 mr-1.5" />
        Applications Closed
      </div>
    );
  }

  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div
      className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full ${daysLeft === 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}
    >
      <ClockIcon className="w-4 h-4 mr-1.5" />
      {daysLeft === 0 ? 'Closes today' : `Closes in ${daysLeft} days`}
    </div>
  );
}