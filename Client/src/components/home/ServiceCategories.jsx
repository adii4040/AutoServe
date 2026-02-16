import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Droplets, 
  Wrench, 
  Settings, 
  Phone, 
  FileText,
  ArrowRight,
  ClipboardCheck
} from 'lucide-react';

const serviceCategories = [
  {
    id: 'car_wash',
    title: 'Car Wash & Detailing',
    description: 'Professional cleaning, waxing, and detailing services',
    icon: Droplets,
    color: 'bg-blue-500',
    features: ['Exterior Wash', 'Interior Cleaning', 'Wax & Polish']
  },
  {
    id: 'mechanical',
    title: 'Mechanical Repairs',
    description: 'Expert mechanical services and maintenance',
    icon: Wrench,
    color: 'bg-orange-500',
    features: ['Engine Service', 'Brake Repair', 'Oil Change']
  },
  {
    id: 'accessories',
    title: 'Accessories & Installation',
    description: 'Car accessories and professional installation',
    icon: Settings,
    color: 'bg-purple-500',
    features: ['Audio Systems', 'Seat Covers', 'LED Lights']
  },
  {
    id: 'emergency',
    title: 'Emergency Roadside Help',
    description: '24/7 emergency assistance when you need it most',
    icon: Phone,
    color: 'bg-red-500',
    features: ['Towing Service', 'Battery Jump', 'Tire Change']
  },
  {
    id: 'insurance',
    title: 'Insurance & Documentation',
    description: 'Vehicle registration, insurance, and paperwork',
    icon: FileText,
    color: 'bg-green-500',
    features: ['Registration', 'Insurance Claims', 'PUC Certificate']
  }
];

export default function ServiceCategories({ onSelectService, onBookInspection }) {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Service Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive car services delivered by trusted professionals right to your doorstep
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Inspection Card */}
          <Card 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 bg-blue-50 min-h-[320px]"
            onClick={onBookInspection}
          >
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <div className="flex items-start space-x-4">
                <div className={`bg-blue-600 rounded-lg p-3 text-white group-hover:scale-110 transition-transform`}>
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700">
                    Book an Inspection
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Not sure what's wrong? A mechanic will diagnose the issue for you.
                  </p>
                  <ul className="space-y-1 mb-4">
                    <li className="text-sm text-gray-500 flex items-center"><ArrowRight className="h-3 w-3 mr-2 text-blue-500" /> On-site Diagnosis</li>
                    <li className="text-sm text-gray-500 flex items-center"><ArrowRight className="h-3 w-3 mr-2 text-blue-500" /> Instant Quote</li>
                    <li className="text-sm text-gray-500 flex items-center"><ArrowRight className="h-3 w-3 mr-2 text-blue-500" /> Transparent Pricing</li>
                  </ul>
                  <div className="flex items-center text-blue-700 font-medium group-hover:text-blue-800">
                    <span className="text-sm">Book Inspection Now</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        
          {serviceCategories.map((service) => {
            const Icon = service.icon;
            return (
              <Card 
                key={service.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 min-h-[320px]"
                onClick={() => onSelectService(service.id)}
              >
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="flex items-start space-x-4">
                    <div className={`${service.color} rounded-lg p-3 text-white group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {service.description}
                      </p>
                      <ul className="space-y-1 mb-4">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-500 flex items-center">
                            <ArrowRight className="h-3 w-3 mr-2 text-blue-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-800">
                        <span className="text-sm">Book Now</span>
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}