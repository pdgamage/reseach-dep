import React from 'react';
import { InfoIcon, ShieldCheckIcon } from 'lucide-react';
export function FairnessPanel() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0 mt-1">
          <ShieldCheckIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            How AI Scoring Works
            <InfoIcon className="w-4 h-4 text-blue-500" />
          </h3>
          <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
            <li>CV is checked against the job requirements</li>
            <li>Skills, education, and experience are matched</li>
            <li>Final score is shown with explanation</li>
            <li>HR can review before making the final decision</li>
          </ul>
        </div>
      </div>
    </div>);

}