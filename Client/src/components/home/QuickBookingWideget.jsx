import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Search } from 'lucide-react';

export default function QuickBookingWidget({ onSearch }) {
  const [searchData, setSearchData] = useState({
    service: '',
    location: '',
    date: '',
    time: ''
  });

  const handleSearch = () => {
    if (searchData.service && searchData.location) {
      onSearch(searchData);
    }
  };

  return (
    <div className="relative -mt-16 z-10">
      <div className="container mx-auto px-4">
  <Card className="max-w-5xl mx-auto shadow-2x1">
          <CardContent className="p-8 lg:p-10">
            <h3 className="text-2xl lg:text-3xl font-semibold text-center mb-8 text-gray-800">
              Book Your Car Service in 3 Easy Steps
            </h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Choose Service</label>
                <Select value={searchData.service} onValueChange={(value) => setSearchData({...searchData, service: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Car Wash & Detailing">Car Wash & Detailing</SelectItem>
                    <SelectItem value="Mechanical Repairs">Mechanical Repairs</SelectItem>
                    <SelectItem value="Accessories & Installation">Accessories & Installation</SelectItem>
                    <SelectItem value="Emergency Roadside">Emergency Roadside</SelectItem>
                    <SelectItem value="Insurance & Docs">Insurance & Docs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Enter your location"
                    className="pl-10"
                    value={searchData.location}
                    onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    type="date"
                    className="pl-10"
                    value={searchData.date}
                    onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Time</label>
                <Select value={searchData.time} onValueChange={(value) => setSearchData({...searchData, time: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning (8AM-12PM)">Morning (8AM-12PM)</SelectItem>
                    <SelectItem value="Afternoon (12PM-5PM)">Afternoon (12PM-5PM)</SelectItem>
                    <SelectItem value="Evening (5PM-8PM)">Evening (5PM-8PM)</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleSearch}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-xl py-4"
              disabled={!searchData.service || !searchData.location}
            >
              <Search className="mr-2 h-5 w-5" />
              Find Service Provider
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}