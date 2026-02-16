import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet, Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Car,
  Bell,
  Home,
  Wrench,
  FileText,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "@/Services/auth/User.services";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRefreshVendor } from "@/hooks/useRefreshVendor";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("VendorDashboard"),
    icon: LayoutDashboard,
    requiresVerification: true,
  },
  {
    title: "My Bookings",
    url: createPageUrl("VendorBookings"),
    icon: Calendar,
    requiresVerification: true,
  },
  {
    title: "Documents",
    url: "/vendor/documents",
    icon: FileText,
    requiresVerification: false,
  },
  {
    title: "Profile",
    url: createPageUrl("VendorProfile"),
    icon: User,
    requiresVerification: false,
  },
];

export default function VendorDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendorInfo, setVendorInfo] = useState(null);

  // Refresh vendor data periodically
  const { data: refreshedVendorData } = useRefreshVendor();

  useEffect(() => {
    const storedVendor = localStorage.getItem('pendingVendor');
    if (storedVendor && storedVendor !== 'null') {
      setVendorInfo(JSON.parse(storedVendor));
    }
  }, []);

  // Update vendorInfo when refreshed data arrives
  useEffect(() => {
    if (refreshedVendorData?.data?.vendor) {
      setVendorInfo(refreshedVendorData.data.vendor);
    }
  }, [refreshedVendorData]);

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/login');
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-indigo-50"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900">AutoServe</span>
                <span className="text-xs text-indigo-600 block leading-none">Vendor Portal</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-indigo-50">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out shadow-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="hidden lg:flex flex-col p-6 border-b border-gray-100 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">AutoServe</h1>
              <p className="text-xs text-indigo-600 font-medium">Vendor Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 mt-16 lg:mt-0">
          {!vendorInfo?.isVerified && (
            <Alert className="mb-4 border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-xs">
                Complete verification to access Dashboard & Bookings
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              const isDisabled = item.requiresVerification && !vendorInfo?.isVerified;
              
              if (isDisabled) {
                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed opacity-50"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </div>

          {/* Go to Home Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
            >
              <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">Go to Customer Portal</span>
            </Link>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
          <div className="mb-3">
            <button 
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-indigo-100"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                V
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 text-sm truncate">
                  Vendor Account
                </p>
                <p className="text-xs text-gray-500 truncate">Service Provider</p>
              </div>
            </button>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4" />
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}