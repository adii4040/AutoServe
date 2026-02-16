// Minimal Select components compatible with project usage
import React, { useState } from 'react';

export const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  const ctx = { value, onValueChange, open, setOpen };
  return (
    <div className="relative">
      {React.Children.map(children, (child) => React.cloneElement(child, { ctx }))}
    </div>
  );
};

export const SelectTrigger = ({ children, ctx }) => {
  return (
    <button
      type="button"
      className="w-full h-10 px-3 py-2 border rounded-md bg-white text-left flex items-center justify-between"
      onClick={() => ctx.setOpen(!ctx.open)}
    >
      {React.Children.map(children, (child) => React.cloneElement(child, { ctx }))}
      <svg className="h-4 w-4 ml-2 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
    </button>
  );
};

export const SelectValue = ({ placeholder, ctx }) => {
  return (
    <span className={ctx.value ? '' : 'text-gray-400'}>
      {ctx.value || placeholder}
    </span>
  );
};

export const SelectContent = ({ children, ctx }) => {
  if (!ctx.open) return null;
  return (
    <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-60 overflow-auto">
      {React.Children.map(children, (child) => React.cloneElement(child, { ctx }))}
    </div>
  );
};

export const SelectItem = ({ value, children, ctx }) => {
  const handleSelect = () => {
    ctx.onValueChange?.(value);
    ctx.setOpen(false);
  };
  return (
    <div
      role="option"
      onClick={handleSelect}
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${ctx.value === value ? 'bg-gray-50' : ''}`}
    >
      {children}
    </div>
  );
};
