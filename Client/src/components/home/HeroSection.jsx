import React from 'react';
import { Button } from "@/components/ui/button";
import { Car, Wrench, Shield, Clock } from 'lucide-react';

export default function HeroSection({ onBookService }) {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')"
        }}
      ></div>
      
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Your Car Services, <br className="hidden sm:block" />
            <span className="text-yellow-400">On-Demand</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-blue-100">
            Professional car services delivered right to your location. 
            Trusted providers, transparent pricing, 24/7 support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={onBookService}
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
            >
              <Car className="mr-2 h-5 w-5" />
              Book a Service Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              <Shield className="mr-2 h-5 w-5" />
              Become a Partner
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Wrench className="h-8 w-8" />
              </div>
              <div className="font-semibold text-lg">500+</div>
              <div className="text-sm text-blue-200">Verified Providers</div>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Car className="h-8 w-8" />
              </div>
              <div className="font-semibold text-lg">50k+</div>
              <div className="text-sm text-blue-200">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-8 w-8" />
              </div>
              <div className="font-semibold text-lg">24/7</div>
              <div className="text-sm text-blue-200">Emergency Support</div>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-8 w-8" />
              </div>
              <div className="font-semibold text-lg">100%</div>
              <div className="text-sm text-blue-200">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}