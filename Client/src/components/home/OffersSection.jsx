import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Percent, Gift, Star } from 'lucide-react';

const offers = [
  {
    id: 1,
    title: 'First Service 20% Off',
    description: 'New customers get 20% discount on their first car wash or service',
    discount: '20%',
    code: 'WELCOME20',
    validUntil: '2024-12-31',
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    icon: Percent
  },
  {
    id: 2,
    title: 'Winter Service Package',
    description: 'Complete winter car care package including battery check & antifreeze',
    discount: '₹999',
    code: 'WINTER999',
    validUntil: '2024-12-31',
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    icon: Gift
  },
  {
    id: 3,
    title: 'Premium Detailing Deal',
    description: 'Full car detailing with ceramic coating at exclusive member price',
    discount: '30%',
    code: 'PREMIUM30',
    validUntil: '2024-12-31',
    color: 'bg-gradient-to-r from-orange-500 to-orange-600',
    icon: Star
  }
];

export default function OffersSection() {
  return (
    <div className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Exclusive Offers & Deals
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Save money with our special offers and seasonal service packages
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {offers.map((offer) => {
            const Icon = offer.icon;
            return (
              <Card key={offer.id} className="bg-white hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                <div className={`${offer.color} p-6 text-white relative`}>
                  <div className="absolute top-4 right-4">
                    <Icon className="h-8 w-8 opacity-30" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{offer.discount}</div>
                  <div className="text-sm opacity-90">OFF</div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {offer.description}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-gray-100">
                        Code: {offer.code}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Valid until {new Date(offer.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <Button className="w-full bg-gray-900 hover:bg-gray-800">
                      Claim This Offer
                    </Button>
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