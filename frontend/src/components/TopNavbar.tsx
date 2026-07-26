import { useAuth } from '../context/AuthContext';
import { LogOut, User, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopNavbarProps {
  isApplicantView?: boolean;
}

const navbarStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
  .tn-root { font-family: 'Poppins', sans-serif; }
`;

export function TopNavbar({ isApplicantView = false }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{navbarStyles}</style>
      <header className="tn-root h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
        {isApplicantView ? (
          <div className="flex items-center gap-2.5 text-indigo-600">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              SmartHire <span className="text-indigo-600">Careers</span>
            </span>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-0.5 border border-indigo-100">
                {user?.role === 'hr' ? 'HR Manager' : 'Applicant'}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <User className="w-4 h-4" />
            </div>
          </div>

          {isApplicantView && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600    transition-all cursor-pointer ml-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </header>
    </>
  );
}