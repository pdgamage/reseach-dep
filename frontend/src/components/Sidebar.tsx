import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Users,
  Search,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const sidebarStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
  .sb-root { font-family: 'Poppins', sans-serif; }
`;

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed: externalCollapsed, onToggle }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = externalCollapsed ?? internalCollapsed;
  const toggleSidebar = onToggle ?? (() => setInternalCollapsed(!internalCollapsed));

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'CV Search Engine',
      path: '/search-cvs',
      icon: Search,
    },
    {
      name: 'Create New Job',
      path: '/jobs/create',
      icon: PlusCircle,
    },
    {
      name: 'Closed Jobs',
      path: '/jobs/closed',
      icon: Briefcase,
    },
    {
      name: 'Interview Schedule',
      path: '/schedule-interview',
      icon: Users,
    },
  ];

  return (
    <>
      <style>{sidebarStyles}</style>
      <div
        className={`sb-root ${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-20 transition-all duration-300`}
      >
        {/* Brand Header & Toggle Button */}
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} border-b border-slate-100`}>
          {isCollapsed ? (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 text-indigo-600 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  S
                </div>
                <div className="transition-opacity duration-300">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight whitespace-nowrap">
                    SmartHire <span className="text-indigo-600">AI</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block whitespace-nowrap">
                    HR Portal
                  </span>
                </div>
              </div>

              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer shrink-0"
                title="Collapse sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3 whitespace-nowrap">
              HR Navigation
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center ${
                    isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                  } py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap transition-opacity duration-300">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Logout Button */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-0' : 'justify-center gap-2 px-3.5'
            } py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}