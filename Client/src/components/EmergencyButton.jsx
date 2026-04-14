import React from 'react';

export default function EmergencyButton() {
  return (
    <a
      href="tel:1800288673783"
      className="group fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-[16px] py-[13px] text-white shadow-[0_14px_32px_rgba(220,38,38,0.45)] transition duration-300 hover:-translate-y-[3px] hover:scale-[1.04] hover:shadow-[0_20px_36px_rgba(220,38,38,0.55)] md:bottom-[88px] md:right-5 md:px-[16px] md:pr-[20px]"
      aria-label="Emergency"
    >
      <span className="emergency-ring absolute inset-0 rounded-full border border-red-300/80" />
      <span className="relative text-[18px] leading-none">+</span>
      <span className="relative hidden text-[13px] font-semibold tracking-[0.02em] md:inline">Emergency</span>
    </a>
  );
}
