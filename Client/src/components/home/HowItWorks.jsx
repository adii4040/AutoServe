import React from 'react';
import { Search, Users, MapPin } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Select Service',
    description: 'Choose from our wide range of car services that fit your needs',
    icon: Search,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Get Nearby Provider Assigned',
    description: 'We match you with verified providers in your area instantly',
    icon: Users,
    color: 'bg-purple-500'
  },
  {
    id: 3,
    title: 'Get Service at Your Location',
    description: 'Professional service delivered right to your doorstep',
    icon: MapPin,
    color: 'bg-green-500'
  }
];

export default function HowItWorks() {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How AutoServe Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting your car serviced has never been easier. Follow these simple steps
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex md:flex-row flex-col gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex-1 text-center relative flex flex-col items-center">
                  {/* Vertical separation line between steps */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 left-[calc(100%+2rem)] w-px h-32 bg-gray-300 transform -translate-y-1/2"></div>
                  )}
                  <div className="relative z-10">
                    <div className={`${step.color} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center mx-auto -mt-10 mb-4 shadow-sm border-2 border-gray-100">
                      <span className="text-sm font-bold text-gray-700">{step.id}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}