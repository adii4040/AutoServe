import React, { useState, useEffect } from 'react';
import { Booking } from '@/entities/Booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Wrench, Calendar, MapPin, User, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const inspectionJobs = await Booking.filter({ is_diagnostic_booking: true }, '-created_date');
        setJobs(inspectionJobs);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      }
      setIsLoading(false);
    };

    fetchJobs();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-600" />
            Inspection Jobs
          </h1>
          <p className="text-gray-600 mt-1">Review and diagnose requested car inspections.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">No Inspection Jobs Available</h2>
            <p className="text-gray-500 mt-2">Check back later for new inspection requests.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle>{job.car_make || "Car Inspection"}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(job.preferred_date), 'PPP')}</span>
                      <span>({job.preferred_time})</span>
                    </div>
                  </div>
                  <Badge 
                    variant={job.status === 'inspection_complete' ? 'default' : 'secondary'}
                    className={job.status === 'inspection_complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {job.status.replace(/_/g, ' ')}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-800">{job.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-800">{job.service_location}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 border-l-4 border-blue-200 pl-3 italic">
                    {job.special_requests || "No special requests."}
                  </p>
                  <div className="flex justify-end mt-4">
                    <Link to={createPageUrl(`InspectionDetail?bookingId=${job.id}`)}>
                      <Button>
                        {job.status === 'inspection_complete' ? 'View Bill' : 'Start Inspection'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}