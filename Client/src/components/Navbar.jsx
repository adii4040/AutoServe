import React, { useContext, useMemo, useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, ChevronDown, LogOut, Menu, User, Headphones } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutUser } from '@/Services/auth/User.services';

// Only show Book Service, My Bookings, History, Support, and user avatar

export default function Navbar() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const isLoggedIn = isAuthenticated;
  const profile = user;
  const initials = useMemo(() => {
    const name = profile?.fullname;
    if (!name) return 'A';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.fullname]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef(null);

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      setMenuOpen(false);
      navigate('/login');
    },
  });

  // Removed setScrolled/onScroll logic: not needed for this navbar

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[72px] bg-white border-b border-slate-100 shadow-sm">
      <div className="main-container flex h-full items-center justify-between">
        <Link to="/home" className="group flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_10px_20px_rgba(249,115,22,0.35)]">
            <Car className="h-5 w-5 text-white" />
          </span>
          <span className="text-[23px] font-extrabold tracking-[-0.02em] text-[#1E3A5F]">AutoServe</span>
        </Link>
        <nav className="hidden items-center gap-2 lg:flex">
          <Link to="/bookservice">
            <Button className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 text-[15px] font-semibold text-white shadow-md mr-2 flex items-center gap-2">
              <Car className="h-4 w-4" /> Book Service
            </Button>
          </Link>
          <Link to="/my-bookings" className="text-[15px] font-medium text-slate-700 px-4 py-2 rounded-full hover:bg-slate-50">My Bookings</Link>
          <Link to="/history" className="text-[15px] font-medium text-slate-700 px-4 py-2 rounded-full hover:bg-slate-50">History</Link>
          <span className="mx-2" />
          <Link to="/support" className="flex items-center gap-1 text-[15px] font-medium text-slate-700 px-4 py-2 rounded-full hover:bg-slate-50">
            <Headphones className="h-4 w-4 mr-1" /> Support
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-[44px] items-center gap-2 rounded-full border border-orange-100 bg-gradient-to-r from-orange-500 to-orange-600 pl-2 pr-3 transition text-white font-semibold shadow-md"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[15px] font-bold text-orange-500">
                  {initials}
                </span>
                <span className="max-w-[120px] truncate text-[15px] font-semibold text-white">{profile?.fullname || 'User'}</span>
                <ChevronDown className="h-4 w-4 text-white" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-[52px] w-[210px] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  <Link
                    to="/user-dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    My Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => logoutMutation.mutate()}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="rounded-full text-[15px] font-semibold text-slate-700 hover:bg-slate-50">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 text-[15px] font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
