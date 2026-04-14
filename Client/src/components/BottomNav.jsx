import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Home, LayoutDashboard, Settings, Wrench } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

const items = [
  { label: 'Home', path: '/home', icon: Home },
  { label: 'Bookings', path: '/my-bookings', icon: Calendar },
  { label: 'Dashboard', path: '/user-dashboard', icon: LayoutDashboard },
  { label: 'Jobs', path: '/my-jobs', icon: Wrench },
  { label: 'Profile', path: '/update-profile', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const { actor, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated || actor !== 'USER') return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/90 shadow-[0_-8px_25px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex h-[68px] w-full max-w-[620px] items-center px-2">
        {items.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className="relative flex flex-1 flex-col items-center justify-center gap-1">
              <Icon className={`h-[18px] w-[18px] ${active ? 'text-[#F97316]' : 'text-slate-500'}`} />
              <span className={`text-[10px] font-semibold leading-none ${active ? 'text-[#F97316]' : 'text-slate-500'}`}>
                {item.label}
              </span>
              <span
                className={`absolute bottom-[5px] h-[4px] w-[4px] rounded-full bg-[#F97316] transition-opacity ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
