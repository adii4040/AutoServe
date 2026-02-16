// Accordion component - Basic implementation
import React, { useState } from 'react';

export const Accordion = ({ children, type = 'single', collapsible = false }) => {
  const [openItems, setOpenItems] = useState([]);

  const handleToggle = (value) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(value) ? [] : [value]);
    } else {
      setOpenItems(
        openItems.includes(value)
          ? openItems.filter((item) => item !== value)
          : [...openItems, value]
      );
    }
  };

  return (
    <div className="space-y-2">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { openItems, onToggle: handleToggle })
      )}
    </div>
  );
};

export const AccordionItem = ({ children, value, openItems = [], onToggle }) => {
  const isOpen = openItems.includes(value);

  return (
    <div className="border border-gray-200 rounded-lg">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { value, isOpen, onToggle })
      )}
    </div>
  );
};

export const AccordionTrigger = ({ children, value, isOpen, onToggle }) => {
  return (
    <button
      onClick={() => onToggle(value)}
      className="flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-gray-50"
    >
      {children}
      <svg
        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

export const AccordionContent = ({ children, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="p-4 pt-0">
      {children}
    </div>
  );
};
