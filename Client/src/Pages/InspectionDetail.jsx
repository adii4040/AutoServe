import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Booking } from '@/entities/Booking';
import { Fault } from '@/entities/Fault';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2, User, Car, Calendar, MapPin, BadgeDollarSign, Save, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import _ from 'lodash';

export default function InspectionDetail() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [faults, setFaults] = useState([]);
  const [selectedFaults, setSelectedFaults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('bookingId');

  useEffect(() => {
    if (!bookingId) {
        setIsLoading(false);
        toast({ title: "Error", description: "No booking ID found in URL.", variant: "destructive" });
        return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const bookingData = await Booking.get(bookingId);
        setBooking(bookingData);
        
        if (bookingData.identified_faults?.length > 0) {
          setSelectedFaults(bookingData.identified_faults);
        }

        const allFaults = await Fault.list();
        setFaults(allFaults);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: "Error", description: "Could not load inspection details.", variant: "destructive" });
      }
      setIsLoading(false);
    };

    fetchData();
  }, [bookingId]);

  const groupedFaults = useMemo(() => _.groupBy(faults, 'category'), [faults]);
  const totalCost = useMemo(() => _.sumBy(selectedFaults, 'cost'), [selectedFaults]);

  const handleFaultToggle = (fault, checked) => {
    if (checked) {
      setSelectedFaults(prev => [...prev, fault]);
    } else {
      setSelectedFaults(prev => prev.filter(f => f.id !== fault.id));
    }
  };

  const handleFinalizeBill = async () => {
    setIsSaving(true);
    try {
      await Booking.update(bookingId, {
        identified_faults: selectedFaults,
        final_bill_amount: totalCost,
        status: 'inspection_complete'
      });
      toast({
        title: "Bill Finalized!",
        description: "The customer can now view the final bill.",
      });
      navigate(createPageUrl('MyJobs'));
    } catch (error) {
      console.error("Failed to finalize bill:", error);
      toast({ title: "Error", description: "Could not save the bill.", variant: "destructive" });
    }
    setIsSaving(false);
  };
  
  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
  if (!booking) return <div className="flex justify-center items-center h-screen"><p>Booking not found or invalid ID.</p></div>;
  
  const isFinalized = booking.status === 'inspection_complete';

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Button variant="outline" onClick={() => navigate(createPageUrl('MyJobs'))} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Inspection for {booking.car_make}</CardTitle>
              <p className="text-gray-500">Diagnose the issues and generate a bill for the customer.</p>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <p className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> {booking.customer_name}</p>
                <p className="flex items-center gap-2"><Car className="w-4 h-4 text-blue-500" /> {booking.car_make}</p>
                <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> {format(new Date(booking.preferred_date), 'PPP')}</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> {booking.service_location}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Fault Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={Object.keys(groupedFaults)} className="w-full">
                {Object.entries(groupedFaults).map(([category, faultsInCategory]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-lg font-medium">{category}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {faultsInCategory.map(fault => (
                          <div key={fault.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`fault-${fault.id}`}
                                checked={selectedFaults.some(f => f.id === fault.id)}
                                onCheckedChange={(checked) => handleFaultToggle(fault, checked)}
                                disabled={isFinalized}
                              />
                              <label htmlFor={`fault-${fault.id}`} className="font-medium text-gray-800 cursor-pointer">
                                {fault.name}
                              </label>
                            </div>
                            <span className="font-semibold text-gray-900">₹{fault.cost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BadgeDollarSign className="w-6 h-6 text-green-600" />
                Final Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedFaults.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Select faults from the checklist to generate the bill.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
                  {selectedFaults.map(fault => (
                    <div key={fault.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{fault.name}</span>
                      <span className="font-medium text-gray-900">₹{fault.cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t pt-4">
              <div className="flex justify-between w-full text-xl font-bold">
                <span>Total:</span>
                <span>₹{totalCost.toLocaleString()}</span>
              </div>
              {!isFinalized && (
                <Button 
                  onClick={handleFinalizeBill} 
                  disabled={isSaving || selectedFaults.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Finalize & Send Bill
                </Button>
              )}
               {isFinalized && (
                <div className="text-center text-green-700 font-medium bg-green-50 p-3 rounded-lg w-full">
                  Bill has been finalized.
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}