import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
  in_progress: { color: "bg-purple-100 text-purple-800", label: "In Progress" },
  completed: { color: "bg-green-100 text-green-800", label: "Completed" },
  cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" }
};

export default function BookingDetailsDialog({ booking, open, onClose }) {
  if (!booking) return null;

  const status = statusConfig[booking.status] || statusConfig.pending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Booking Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Booking ID</p>
            <p className="font-mono text-sm">#{booking.id.slice(0, 12)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Status</p>
            <Badge className={status.color}>
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Service</p>
              <p className="font-semibold">{booking.service_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Vendor</p>
              <p className="font-semibold">{booking.vendor_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{format(new Date(booking.date), "MMMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{booking.time}</p>
              </div>
            </div>
          </div>

          {booking.price && (
            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">Total Price</p>
                <p className="text-2xl font-bold text-green-700">${booking.price}</p>
              </div>
            </div>
          )}

          {booking.notes && (
            <div className="flex gap-2">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{booking.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}