import React from 'react';
import { Button } from "@/components/ui/button";
import { Car, Users, ArrowRight } from 'lucide-react';

export default function CTASection({ onBookService, onBecomePartner }) {
  return (
    <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="container mx-auto px-4">
        <div className="text-center text-white mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Experience AutoServe?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers or become a partner provider today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Car className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Customers</h3>
            <p className="text-gray-600 mb-6">
              Book professional car services with trusted providers. Quick, convenient, and reliable.
            </p>
            <Button 
              onClick={onBookService}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg w-full"
            >
              Book Service Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Providers</h3>
            <p className="text-gray-600 mb-6">
              Grow your business by partnering with AutoServe. Get more customers and increase revenue.
            </p>
            <Button 
              onClick={onBecomePartner}
              variant="outline"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 text-lg w-full"
            >
              Become a Partner <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}