import React from "react";
import { Button } from "../../../components/ui/button";
import { Eye, Building2, User, Phone, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function VendorRow({ vendor, onView, isMobile = false }) {

  // safe date formatting helper
  const formatDate = (dateStr) => {
    try {
      return dateStr ? format(new Date(dateStr), "MMM d, yyyy") : "-";
    } catch {
      return "-";
    }
  };

  if (isMobile) {
    return (
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {vendor?.avatar?.url ? (
              <img
                src={vendor.avatar.url}
                alt={vendor.shopName}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {vendor?.shopName || "Unknown Vendor"}
              </h3>
              <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                <User className="w-3 h-3" />
                {vendor?.fullname || "Unknown Owner"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{vendor?.phone || "-"}</span>
          </div>
          {vendor?.address?.shopAddress && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{vendor.address.shopAddress}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">
            Submitted: {formatDate(vendor?.createdAt)}
          </span>
        </div>

        <Button
          onClick={onView}
          className="w-full bg-blue-600 hover:bg-blue-700"
          aria-label={`View details for ${vendor?.shopName || "vendor"}`}
        >
          <Eye className="w-4 h-4 mr-2" />
          View & Verify
        </Button>
      </div>
    );
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {vendor?.avatar?.url ? (
            <img
              src={vendor.avatar.url}
              alt={vendor.shopName}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {vendor?.shopName || "Unknown Vendor"}
            </div>
            {vendor?.address?.shopAddress && (
              <div className="text-xs text-gray-500 max-w-xs truncate">
                {vendor.address.shopAddress}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{vendor?.fullname || "-"}</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{vendor?.phone || "-"}</div>
        {vendor?.email && <div className="text-xs text-gray-500">{vendor.email}</div>}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(vendor?.createdAt)}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button
          variant="outline"
          size="sm"
          onClick={onView}
          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
          aria-label={`View details for ${vendor?.shopName || "vendor"}`}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </td>
    </tr>
  );
}
