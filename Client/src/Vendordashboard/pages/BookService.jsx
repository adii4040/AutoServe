import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BookService() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    service_id: "",
    vendor_id: "",
    date: "",
    time: "",
    notes: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list(),
    initialData: [],
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data) => {
      const service = services.find(s => s.id === data.service_id);
      const vendor = vendors.find(v => v.id === data.vendor_id);
      
      return base44.entities.Booking.create({
        ...data,
        service_name: service?.name || "",
        vendor_name: vendor?.name || "",
        price: service?.base_price || 0,
        status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setShowSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("Bookings"));
      }, 2000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createBookingMutation.mutate(formData);
  };

  const selectedService = services.find(s => s.id === formData.service_id);

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-none shadow-xl">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your service has been successfully booked</p>
            <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Service</h1>
        <p className="text-gray-600">Schedule your next vehicle service appointment</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="service">Select Service *</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.base_price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedService && (
                <p className="text-sm text-gray-500">{selectedService.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Choose Vendor *</Label>
              <Select
                value={formData.vendor_id}
                onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name} - ⭐ {vendor.rating}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Service Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Service Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any specific requirements or concerns..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            {selectedService && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Estimated Price:</span>
                  <span className="text-2xl font-bold text-blue-600">${selectedService.base_price}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg"
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? "Booking..." : "Book Service"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}