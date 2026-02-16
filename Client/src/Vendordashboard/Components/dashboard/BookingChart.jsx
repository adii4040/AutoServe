import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

export default function BookingChart({ data }) {
  return (
    <Card className="p-6 border-none shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007BFF" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#007BFF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
            }}
          />
          <Area
            type="monotone"
            dataKey="bookings"
            stroke="#007BFF"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorBookings)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}