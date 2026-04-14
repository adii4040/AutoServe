import React from 'react';
import { ArrowRight, CheckCircle2, ClipboardCheck, Shield, Sparkles, Star, Timer, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Booking } from '@/entities/Booking';
import { toast } from '@/components/ui/use-toast';

const stats = [
  { label: 'Verified Mechanics', value: '500+' },
  { label: 'Services Completed', value: '50K+' },
  { label: 'Avg. Arrival Time', value: '32 min' },
  { label: 'Customer Rating', value: '4.9/5' },
];

const services = [
  {
    id: 'inspection',
    title: 'Book an Inspection',
    description: 'Not sure what is wrong? Get a complete diagnosis with instant service recommendations.',
    icon: ClipboardCheck,
    cta: 'Book Inspection',
    type: 'inspection',
  },
  {
    id: 'mechanical',
    title: 'Mechanical Repair',
    description: 'Engine, suspension, brake and complete mechanical solutions by certified providers.',
    icon: Wrench,
    cta: 'Book Mechanical',
    type: 'service',
  },
  {
    id: 'electrical',
    title: 'Electrical Service',
    description: 'Battery, wiring, sensors and electronics support delivered at your location.',
    icon: Sparkles,
    cta: 'Book Electrical',
    type: 'service',
  },
  {
    id: 'detailing',
    title: 'Detailing & Protection',
    description: 'Premium interior care, ceramic wash and exterior detailing packages.',
    icon: Shield,
    cta: 'Book Detailing',
    type: 'service',
  },
];

const steps = [
  {
    title: 'Choose Service',
    desc: 'Pick an inspection or service package in a few taps.',
  },
  {
    title: 'Provider Assigned',
    desc: 'Nearby verified provider is matched instantly.',
  },
  {
    title: 'Live Arrival',
    desc: 'Track provider ETA and updates in real time.',
  },
  {
    title: 'Service Complete',
    desc: 'Approve, pay and rate once work is completed.',
  },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    city: 'Mumbai',
    quote: 'Smooth process end to end. Technician reached quickly and explained everything clearly.',
  },
  {
    name: 'Priya Patel',
    city: 'Delhi',
    quote: 'Emergency support was excellent. I could track the mechanic and get help on time.',
  },
  {
    name: 'Arjun Mehta',
    city: 'Bangalore',
    quote: 'Great workmanship and transparent pricing. The experience felt premium and reliable.',
  },
];

export default function Home() {
  const handleBookService = () => {
    toast({
      title: 'Booking System',
      description: 'Service booking feature coming soon! Please call us for immediate assistance.',
    });
  };

  const handleSearch = (searchData) => {
    toast({
      title: 'Search Results',
      description: `Searching for ${searchData.service} providers in ${searchData.location}...`,
    });
  };

  const handleSelectService = (serviceId) => {
    toast({
      title: 'Service Selected',
      description: `Selected service: ${serviceId}. Booking interface coming soon!`,
    });
  };

  const handleBookInspection = async () => {
    try {
      const bookingData = {
        customer_name: 'Test Customer',
        customer_phone: '1234567890',
        service_location: 'Test Location, City',
        preferred_date: new Date().toISOString().split('T')[0],
        preferred_time: 'Flexible',
        car_make: 'Unknown Car',
        special_requests: 'Customer is unsure about the issue, requires full diagnosis.',
        is_diagnostic_booking: true,
        status: 'pending_inspection',
      };
      await Booking.create(bookingData);
      toast({
        title: 'Inspection Booked!',
        description: 'A provider will be assigned shortly to diagnose your car issue.',
      });
    } catch (error) {
      console.error('Failed to book inspection:', error);
      toast({
        title: 'Booking Failed',
        description: 'Could not create an inspection booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBecomePartner = () => {
    toast({
      title: 'Partner Registration',
      description: 'Partner registration form coming soon! Please contact us for immediate assistance.',
    });
  };

  return (
    <div className="w-full overflow-x-hidden bg-white text-slate-900">
      <section className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-gradient-to-br from-[#FFF7ED] via-white to-[#EFF6FF]">
        <div className="pointer-events-none absolute -right-[180px] -top-[160px] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.24)_0%,rgba(249,115,22,0.04)_55%,rgba(249,115,22,0)_74%)]" />
        <div className="main-container grid min-h-[calc(100vh-72px)] items-center gap-12 py-14 lg:grid-cols-[1.03fr_0.97fr] lg:py-20">
          <div className="max-w-[620px]">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.09em] text-orange-700">
              <Sparkles className="h-3.5 w-3.5" />
              On-demand car care platform
            </p>
            <h1 className="text-[2.15rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#1E3A5F] sm:text-[2.9rem] lg:text-[3.45rem]">
              Your Car Service Team,
              <span className="block text-[#F97316]">Always Near You</span>
            </h1>
            <p className="mt-5 max-w-[540px] text-[1.03rem] leading-7 text-slate-600">
              Book repairs, diagnostics and maintenance in minutes. AutoServe connects you with verified providers, live tracking and transparent pricing.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleBookService}
                className="btn-sheen h-[48px] rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 text-[15px] font-semibold text-white shadow-[0_14px_28px_rgba(249,115,22,0.35)] transition hover:-translate-y-1 hover:from-orange-600 hover:to-orange-700 hover:shadow-[0_20px_34px_rgba(249,115,22,0.45)]"
              >
                Book a Service
              </Button>
              <Button
                variant="outline"
                onClick={handleBecomePartner}
                className="btn-sheen h-[48px] rounded-full border-slate-300 bg-white px-6 text-[15px] font-semibold text-slate-700 transition hover:-translate-y-1 hover:bg-slate-50"
              >
                Become a Partner
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[530px]">
            <div className="rounded-[30px] border border-white/70 bg-white/65 p-6 shadow-[0_22px_60px_rgba(30,58,95,0.16)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Live Service Tracker</p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Active</span>
              </div>
              <div className="space-y-3 rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Provider ETA</span>
                  <span className="font-semibold text-slate-800">12 min</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-500">
                  <span className="rounded-xl bg-slate-50 px-2 py-2">Dispatch</span>
                  <span className="rounded-xl bg-orange-50 px-2 py-2 text-orange-700">En Route</span>
                  <span className="rounded-xl bg-slate-50 px-2 py-2">Arrive</span>
                </div>
              </div>
            </div>

            <div className="absolute -left-8 top-8 hidden w-[170px] rounded-2xl border border-white/80 bg-white/80 p-3 shadow-[0_12px_32px_rgba(15,23,42,0.13)] backdrop-blur lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Today</p>
              <p className="mt-1 text-xl font-extrabold text-[#1E3A5F]">08 Jobs</p>
              <p className="text-xs text-slate-500">completed nearby</p>
            </div>

            <div className="absolute -bottom-8 right-2 hidden w-[188px] rounded-2xl border border-white/80 bg-white/80 p-3 shadow-[0_12px_32px_rgba(15,23,42,0.13)] backdrop-blur lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Customer rating</p>
              <div className="mt-1 flex items-center gap-1 text-orange-500">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
              <p className="text-xs text-slate-500">4.9 average from 17k+ reviews</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0F172A] py-8">
        <div className="main-container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-[2rem] font-extrabold text-white">{item.value}</p>
              <p className="text-[13px] font-medium text-slate-300">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="py-16 sm:py-20">
        <div className="main-container">
          <div className="mx-auto mb-11 max-w-[680px] text-center">
            <h2 className="text-[2rem] font-extrabold tracking-[-0.02em] text-[#1E3A5F] sm:text-[2.45rem]">Services Built Around Your Car</h2>
            <p className="mt-3 text-[1rem] leading-7 text-slate-600">Choose from specialized offerings designed for fast, transparent and high-quality support.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon;
              const onClick = service.type === 'inspection'
                ? handleBookInspection
                : () => {
                  handleSearch({ service: service.title, location: 'Your area' });
                  handleSelectService(service.id);
                };

              return (
                <button
                  type="button"
                  key={service.id}
                  onClick={onClick}
                  className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_34px_rgba(15,23,42,0.12)]"
                >
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-50/0 via-orange-50/60 to-orange-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-[1.15rem] font-bold text-slate-900">{service.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
                      <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
                        {service.cta}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-50 py-16 sm:py-20">
        <div className="main-container">
          <div className="mx-auto mb-12 max-w-[680px] text-center">
            <h2 className="text-[2rem] font-extrabold tracking-[-0.02em] text-[#1E3A5F] sm:text-[2.45rem]">How AutoServe Works</h2>
            <p className="mt-3 text-[1rem] leading-7 text-slate-600">From booking to completion, everything is structured for speed and clarity.</p>
          </div>

          <div className="relative grid gap-5 lg:grid-cols-4">
            <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[42px] hidden h-px bg-slate-200 lg:block" />
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_34px_rgba(15,23,42,0.12)]"
              >
                <span className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
                  {index + 1}
                </span>
                {index < steps.length - 1 && (
                  <span className="absolute right-[-10px] top-[38px] hidden h-2 w-2 rounded-full bg-slate-300 lg:block" />
                )}
                <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              onClick={handleBookService}
              className="btn-sheen h-[48px] rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-7 text-[15px] font-semibold text-white shadow-[0_14px_28px_rgba(249,115,22,0.35)] transition hover:-translate-y-1"
            >
              Start Booking
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="main-container grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
          <div>
            <h2 className="text-[2rem] font-extrabold tracking-[-0.02em] text-[#1E3A5F] sm:text-[2.45rem]">Why Drivers Trust AutoServe</h2>
            <p className="mt-4 text-[1rem] leading-7 text-slate-600">Our platform balances speed, quality and reliability with a service journey that feels premium every time.</p>

            <div className="mt-7 space-y-4">
              {[
                'Verified providers and quality checks for every booking.',
                'Live status updates from dispatch to service completion.',
                'Transparent pricing and detailed work summaries.',
                'Emergency-ready support with fast assignment.',
              ].map((text) => (
                <div key={text} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-6 text-slate-700">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/75 p-6 shadow-[0_24px_60px_rgba(30,58,95,0.14)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Service Journey</h3>
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">Live Timeline</span>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="h-9 w-9 rounded-full bg-orange-100" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Assigned provider</p>
                  <p className="text-xs text-slate-500">Rajat Singh accepted your booking</p>
                </div>
              </div>
              <div className="space-y-3">
                {[['Dispatching', true], ['En Route', true], ['Inspection', false], ['Completion', false]].map(([label, done]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <p className="text-sm text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-[#1E3A5F] p-4 text-white">
                <p className="text-xs text-slate-200">Current ETA</p>
                <p className="mt-1 text-2xl font-extrabold">12 min</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="bg-slate-50 py-16 sm:py-20">
        <div className="main-container">
          <div className="mx-auto mb-11 max-w-[680px] text-center">
            <h2 className="text-[2rem] font-extrabold tracking-[-0.02em] text-[#1E3A5F] sm:text-[2.45rem]">Customer Stories</h2>
            <p className="mt-3 text-[1rem] leading-7 text-slate-600">Real feedback from customers using AutoServe for regular and emergency support.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_34px_rgba(15,23,42,0.12)]"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="text-3xl leading-none text-orange-200">"</p>
                <div className="mt-2 flex items-center gap-1 text-orange-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.quote}</p>
                <div className="mt-5">
                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.city}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 sm:py-20">
        <div className="main-container">
          <div className="rounded-[28px] bg-gradient-to-r from-[#1E3A5F] via-[#2D5A8E] to-[#1E3A5F] px-6 py-12 text-center text-white sm:px-10 sm:py-14">
            <h2 className="text-[2rem] font-extrabold tracking-[-0.02em] sm:text-[2.5rem]">Ready to Experience AutoServe?</h2>
            <p className="mx-auto mt-4 max-w-[660px] text-sm leading-7 text-slate-200 sm:text-base">
              Join thousands of vehicle owners who trust AutoServe for reliable repairs, inspection and doorstep convenience.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                onClick={handleBookService}
                className="btn-sheen h-[48px] rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 text-[15px] font-semibold text-white shadow-[0_14px_28px_rgba(249,115,22,0.35)] transition hover:-translate-y-1"
              >
                Book Service
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleBecomePartner}
                className="btn-sheen h-[48px] rounded-full border-white/70 bg-white px-6 text-[15px] font-semibold text-slate-800 transition hover:-translate-y-1 hover:bg-slate-100"
              >
                Become a Partner
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className="main-container flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-[13px] text-slate-500 sm:justify-between">
          <p>AutoServe support: support@autoserve.com</p>
          <div className="flex gap-5">
            <a href="#" className="transition hover:text-orange-600">Privacy</a>
            <a href="#" className="transition hover:text-orange-600">Terms</a>
            <a href="#" className="transition hover:text-orange-600">Help</a>
          </div>
        </div>
      </section>
    </div>
  );
}
