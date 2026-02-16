import React, { useState, useEffect } from "react";
import { Calendar, Search, Filter, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking } from "@/entities/Booking";
import { useNavigate } from "react-router-dom";
import { useRefreshVendor } from "../../hooks/useRefreshVendor";

export default function VendorBookings() {
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorInfo, setVendorInfo] = useState(null);
  const navigate = useNavigate();

  // Refresh vendor data periodically
  const { data: refreshedVendorData } = useRefreshVendor();

  useEffect(() => {
    const storedVendor = localStorage.getItem('pendingVendor');
    if (storedVendor) {
      setVendorInfo(JSON.parse(storedVendor));
    }
  }, []);

  // Update vendorInfo when refreshed data arrives
  useEffect(() => {
    if (refreshedVendorData?.data?.vendor) {
      setVendorInfo(refreshedVendorData.data.vendor);
    }
  }, [refreshedVendorData]);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const allBookings = await Booking.getAll();
        
        // If no bookings from API, use mock data for demonstration
        const bookingsData = allBookings.length > 0 ? allBookings : [
          { 
            id: 1, 
            customer_name: "John Doe", 
            service_name: "Oil Change", 
            status: "pending", 
            preferred_date: "2025-10-28", 
            preferred_time: "10:00 AM", 
            price: 50 
          },
          { 
            id: 2, 
            customer_name: "Jane Smith", 
            service_name: "Brake Repair", 
            status: "in_progress", 
            preferred_date: "2025-10-27", 
            preferred_time: "2:00 PM", 
            price: 150 
          },
          { 
            id: 3, 
            customer_name: "Mike Johnson", 
            service_name: "Tire Rotation", 
            status: "completed", 
            preferred_date: "2025-10-26", 
            preferred_time: "9:00 AM", 
            price: 40 
          },
          { 
            id: 4, 
            customer_name: "Sarah Williams", 
            service_name: "Engine Diagnostic", 
            status: "pending", 
            preferred_date: "2025-10-29", 
            preferred_time: "11:30 AM", 
            price: 80 
          },
          { 
            id: 5, 
            customer_name: "Tom Brown", 
            service_name: "Battery Replacement", 
            status: "completed", 
            preferred_date: "2025-10-25", 
            preferred_time: "3:00 PM", 
            price: 120 
          },
        ];
        
        setBookings(bookingsData);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const statusFilters = [
    { label: "All", value: "all", count: bookings.length },
    { label: "Pending", value: "pending", count: bookings.filter(b => b.status === 'pending').length },
    { label: "In Progress", value: "in_progress", count: bookings.filter(b => b.status === 'in_progress').length },
    { label: "Completed", value: "completed", count: bookings.filter(b => b.status === 'completed').length },
  ];

  const filteredBookings = bookings.filter(booking => {
    const statusMatch = activeStatus === "all" || booking.status === activeStatus;
    const searchMatch = searchQuery === "" || 
      (booking.customer_name && booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.service_name && booking.service_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.car_make && booking.car_make.toLowerCase().includes(searchQuery.toLowerCase()));
    return statusMatch && searchMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Check if vendor is verified
  if (vendorInfo && !vendorInfo.isVerified) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Required</h2>
            <p className="text-gray-600 mb-6">
              Your account is pending physical verification by our team. You'll be able to access bookings once your account is verified.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/vendor/documents')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                View Verification Status
              </button>
              <button
                onClick={() => navigate('/vendor/profile')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit Profile
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage and track all your service bookings</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by customer name or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white shadow-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-3">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveStatus(filter.value)}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              activeStatus === filter.value
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {filter.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeStatus === filter.value 
                ? "bg-white/20 text-white" 
                : "bg-gray-100 text-gray-600"
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="border-none shadow-lg">
          <CardContent className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {activeStatus === "all" 
                ? "You don't have any bookings yet" 
                : `No ${activeStatus.replace('_', ' ')} bookings`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {(booking.customer_name || 'C').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{booking.customer_name || 'Customer'}</h3>
                      <p className="text-sm text-gray-600">{booking.service_name || booking.car_make || 'Service'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {booking.preferred_date || booking.date}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{booking.preferred_time || booking.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="text-2xl font-bold text-indigo-600">${booking.price || 0}</div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border inline-flex ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <Button variant="outline" size="sm" className="mt-2 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}