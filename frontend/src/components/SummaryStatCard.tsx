import React from 'react';
import { BoxIcon } from 'lucide-react';
interface SummaryStatCardProps {
  title: string;
  value: string | number;
  icon: BoxIcon;
  trend?: string;
  trendUp?: boolean;
}
export function SummaryStatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp
}: SummaryStatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend &&
      <div className="mt-4 flex items-center text-sm">
          <span
          className={`font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          
            {trend}
          </span>
          <span className="text-slate-500 ml-2">vs last month</span>
        </div>
      }
    </div>);

}