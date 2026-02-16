import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star, User } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Rahul Sharma',
    location: 'Mumbai',
    rating: 5,
    comment: 'Excellent service! They came to my office and cleaned my car perfectly. Very professional and punctual.',
    service: 'Car Wash'
  },
  {
    id: 2,
    name: 'Priya Patel',
    location: 'Delhi',
    rating: 5,
    comment: 'Had an emergency breakdown on the highway. AutoServe team reached within 30 minutes and fixed the issue.',
    service: 'Emergency Service'
  },
  {
    id: 3,
    name: 'Arjun Mehta',
    location: 'Bangalore',
    rating: 4,
    comment: 'Great experience with their mechanical repair service. Fair pricing and quality work. Highly recommended!',
    service: 'Mechanical Repair'
  }
];

export default function TestimonialsSection() {
  return (
    <div className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-10 pb-6 px-6 text-center min-h-[270px] flex flex-col justify-between">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({testimonial.rating}.0)</span>
                </div>
                
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.comment}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.location}</div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {testimonial.service}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}