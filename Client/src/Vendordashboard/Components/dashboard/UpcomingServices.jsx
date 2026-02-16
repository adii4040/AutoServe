import React from "react";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Star } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800"
};

export default function UpcomingServices({ bookings }) {
  return (
    <Card className="p-6 border-none shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Services</h3>
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming services</p>
          </div>
        ) : (
          bookings.slice(0, 3).map((booking) => (
            <div
              key={booking.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1">{booking.service_name}</h4>
                <p className="text-sm text-gray-600 mb-2">{booking.vendor_name}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(booking.date), "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {booking.time}
                  </span>
                </div>
              </div>
              <Badge className={statusColors[booking.status]}>
                {booking.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}