import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Search, Filter, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../../../components/ui/alert"
import VendorRow from "../vendor_verification/vendor_row";
import VendorDrawer from "../vendor_verification/vendor_drawer";
import { useFetchUnverifiedVendors } from "../../../hooks/useFetchUnverifiedVendor";

export default function EmployeeVendorVerification() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const itemsPerPage = 20;

  const queryClient = useQueryClient();

  const { data: allVendors = [], isLoading, error } = useFetchUnverifiedVendors();
  //console.log(allVendors?.data?.vendors)

  const vendorList = allVendors?.data?.vendors || [];

  // Filter vendors by search query
  const filteredVendors = vendorList.filter((vendor) => {
    console.log(vendor)
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      (vendor.address.shopAddress && vendor.address.shopAddress.toLowerCase().includes(q)) ||
      (vendor.shopName && vendor.shopName.toLowerCase().includes(q)) ||
      (vendor.fullname && vendor.fullname.toLowerCase().includes(q)) ||
      (vendor.phone && vendor.phone.includes(searchQuery));
      
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage);

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    setDrawerOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vendor Verification</h1>
              <p className="text-sm text-gray-500 mt-1">Review and verify pending vendor applications</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                {filteredVendors.length} Pending
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by vendor name, owner name, or phone..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full"
              aria-label="Search vendors"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && vendorList.length === 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load vendors. Please try again.</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-200 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredVendors.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Vendors</h3>
            <p className="text-gray-500">
              {searchQuery ? "No vendors match your search criteria." : "All vendors have been verified. Great job!"}
            </p>
          </div>
        )}

        {/* Vendor Table */}
        {!isLoading && paginatedVendors.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedVendors.map((vendor) => (
                      <VendorRow key={vendor._id} vendor={vendor} onView={() => handleViewVendor(vendor)} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {paginatedVendors.map((vendor) => (
                <VendorRow key={vendor._id} vendor={vendor} onView={() => handleViewVendor(vendor)} isMobile />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredVendors.length)}</span> of{" "}
                  <span className="font-medium">{filteredVendors.length}</span> results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                        className="w-8 h-8 p-0"
                        aria-label={`Page ${i + 1}`}
                        aria-current={currentPage === i + 1 ? "page" : undefined}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Vendor Detail Drawer */}
      {selectedVendor && (
        <VendorDrawer
          vendor={selectedVendor}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onVerificationComplete={() => {
            setDrawerOpen(false);
            setSelectedVendor(null);
          }}
        />
      )}
    </div>
  );
}
