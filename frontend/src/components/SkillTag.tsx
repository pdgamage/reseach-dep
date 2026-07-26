import React from 'react';
interface SkillTagProps {
  skill: string;
  onRemove?: () => void;
}
export function SkillTag({ skill, onRemove }: SkillTagProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
      {skill}
      {onRemove &&
      <button
        type="button"
        onClick={onRemove}
        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600 focus:outline-none">
        
          <span className="sr-only">Remove {skill}</span>
          <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          
            <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12" />
          
          </svg>
        </button>
      }
    </span>);

}