import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, MapPin, DollarSign, Clock } from 'lucide-react';

const features = [
  {
    title: 'Trusted & Verified Providers',
    description: 'All our service providers are thoroughly vetted and verified for quality and reliability',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Location-Based Matching',
    description: 'Smart matching algorithm connects you with the nearest qualified service provider',
    icon: MapPin,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Transparent Pricing',
    description: 'No hidden charges. See upfront pricing and pay only for what you book',
    icon: DollarSign,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: '24×7 Emergency Support',
    description: 'Round-the-clock support for emergency services when you need help the most',
    icon: Clock,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
];

export default function WhyChooseUs() {
  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose AutoServe?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the best car service experience with these key advantages
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-10 pb-6 px-6 text-center min-h-[270px] flex flex-col justify-between">
                  <div className={`${feature.bgColor} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}