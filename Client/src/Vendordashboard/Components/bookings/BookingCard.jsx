import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, DollarSign, X, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
  confirmed: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Confirmed" },
  in_progress: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "In Progress" },
  completed: { color: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
  cancelled: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" }
};

export default function BookingCard({ booking, onCancel, onViewDetails }) {
  const status = statusConfig[booking.status] || statusConfig.pending;

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-none shadow-sm">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{booking.service_name}</h3>
              <p className="text-sm text-gray-600 mt-1">Booking ID: #{booking.id.slice(0, 8)}</p>
            </div>
            <Badge className={`${status.color} border`}>
              {status.label}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{booking.vendor_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{format(new Date(booking.date), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{booking.time}</span>
            </div>
            {booking.price && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="font-semibold">${booking.price}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex md:flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(booking)}
            className="flex-1 md:flex-none"
          >
            <Eye className="w-4 h-4 mr-2" />
            Details
          </Button>
          
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, keep it</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onCancel(booking.id)}>
                    Yes, cancel booking
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </Card>
  );
}