import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter } from "lucide-react";

export default function BookingFilters({ activeStatus, setActiveStatus }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Filter className="w-5 h-5 text-gray-400" />
      <Tabs value={activeStatus} onValueChange={setActiveStatus} className="w-full">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}