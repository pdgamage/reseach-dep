import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  PlusCircleIcon,
  BriefcaseIcon,
  UsersIcon,
  SearchIcon } from
'lucide-react';
export function Sidebar() {
  const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboardIcon
  },
  {
    name: 'CV Search Engine',
    path: '/search-cvs',
    icon: SearchIcon
  },
  {
    name: 'Create New Job',
    path: '/jobs/create',
    icon: PlusCircleIcon
  },
  {
    name: 'Closed Jobs',
    path: '/jobs/closed',
    icon: BriefcaseIcon
  },
  {
    name: 'Interview Schedule',
    path: '/schedule-interview',
    icon: UsersIcon
  }];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-indigo-600">
          <BriefcaseIcon className="w-6 h-6" />
          <span className="text-lg font-bold tracking-tight">SmartHire AI</span>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 flex flex-col gap-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
          HR Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
              }>
              
              <Icon className="w-5 h-5" />
              {item.name}
            </NavLink>);

        })}
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-700 mb-1">
            <UsersIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Need Help?</span>
          </div>
          <p className="text-xs text-slate-500">
            Contact system admin for support with AI shortlisting.
          </p>
        </div>
      </div>
    </div>);

}