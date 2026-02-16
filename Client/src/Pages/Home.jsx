import React from 'react';
import { Booking } from '@/entities/Booking';
import { toast } from "@/components/ui/use-toast";

import HeroSection from '../components/home/HeroSection';
import QuickBookingWidget from '../components/home/QuickBookingWideget';
import ServiceCategories from '../components/home/ServiceCategories';
import HowItWorks from '../components/home/HowItWorks';
import WhyChooseUs from '../components/home/WhyChooseUs';
import OffersSection from '../components/home/OffersSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTASection from '../components/home/CTASection';

export default function Home() {
  const handleBookService = () => {
    toast({
      title: "Booking System",
      description: "Service booking feature coming soon! Please call us for immediate assistance.",
    });
  };

  const handleSearch = (searchData) => {
    toast({
      title: "Search Results",
      description: `Searching for ${searchData.service} providers in ${searchData.location}...`,
    });
  };

  const handleSelectService = (serviceId) => {
    toast({
      title: "Service Selected",
      description: `Selected service: ${serviceId}. Booking interface coming soon!`,
    });
  };

  const handleBookInspection = async () => {
    try {
      // Dummy data for creating an inspection booking
      const bookingData = {
        customer_name: "Test Customer",
        customer_phone: "1234567890",
        service_location: "Test Location, City",
        preferred_date: new Date().toISOString().split('T')[0],
        preferred_time: "Flexible",
        car_make: "Unknown Car",
        special_requests: "Customer is unsure about the issue, requires full diagnosis.",
        is_diagnostic_booking: true,
        status: 'pending_inspection'
      };
      await Booking.create(bookingData);
      toast({
        title: "Inspection Booked!",
        description: "A provider will be assigned shortly to diagnose your car's issue.",
      });
    } catch(error) {
       console.error("Failed to book inspection:", error);
       toast({
        title: "Booking Failed",
        description: "Could not create an inspection booking. Please try again.",
        variant: "destructive"
       });
    }
  };

  const handleBecomePartner = () => {
    toast({
      title: "Partner Registration",
      description: "Partner registration form coming soon! Please contact us for immediate assistance.",
    });
  };

  return (
    <div className="min-h-screen">
      <HeroSection onBookService={handleBookService} />
      <QuickBookingWidget onSearch={handleSearch} />
      <ServiceCategories onSelectService={handleSelectService} onBookInspection={handleBookInspection} />
      <HowItWorks />
      <WhyChooseUs />
      <OffersSection />
      <TestimonialsSection />
      <CTASection 
        onBookService={handleBookService} 
        onBecomePartner={handleBecomePartner}
      />
    </div>
  );
}