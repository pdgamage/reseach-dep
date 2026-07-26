import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOutIcon, UserIcon, BriefcaseIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface TopNavbarProps {
  isApplicantView?: boolean;
}
export function TopNavbar({ isApplicantView = false }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      {isApplicantView ?
      <div className="flex items-center gap-2 text-indigo-600">
          <BriefcaseIcon className="w-6 h-6" />
          <span className="text-lg font-bold tracking-tight">
            SmartHire Careers
          </span>
        </div> :

      <div className="flex-1">
          {/* Empty div to push content to right when sidebar is present */}
        </div>
      }

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-900">
              {user?.name || 'User'}
            </span>
            <span className="text-xs text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded-full mt-0.5">
              {user?.role === 'hr' ? 'HR Manager' : 'Applicant'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <UserIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors">
          
          <LogOutIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>);

}