// Sheet component - Minimal implementation with context state
import React, { createContext, useContext, useMemo, useState } from 'react';

const SheetContext = createContext(null);

export const Sheet = ({ children, defaultOpen = false, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (newOpen) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };
  
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
};

export const useSheet = () => {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error('Sheet components must be used within <Sheet>');
  return ctx;
};

export const SheetTrigger = ({ children, asChild = false, ...props }) => {
  const { open, setOpen } = useSheet();
  const child = asChild && React.isValidElement(children) ? children : <button type="button">{children}</button>;
  const onClick = (e) => {
    props.onClick?.(e);
    setOpen(!open);
  };
  return React.cloneElement(child, { ...props, onClick });
};

export const SheetContent = ({ children, side = 'left', className = '' }) => {
  const { open, setOpen } = useSheet();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" data-state={open ? 'open' : 'closed'}>
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      {/* panel */}
      <div
        className={`absolute inset-y-0 ${side === 'left' ? 'left-0' : 'right-0'} w-80 bg-white shadow-xl p-6 overflow-y-auto ${className}`}
      >
        {/* Hidden close button to support programmatic close from external code */}
        <button type="button" className="hidden" onClick={() => setOpen(false)} />
        {children}
      </div>
    </div>
  );
};

export const SheetClose = ({ children, asChild = false, ...props }) => {
  const { setOpen } = useSheet();
  const child = asChild && React.isValidElement(children) ? children : <button type="button">{children}</button>;
  const onClick = (e) => {
    props.onClick?.(e);
    setOpen(false);
  };
  return React.cloneElement(child, { ...props, onClick });
};

export const SheetHeader = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-2 text-left ${className}`} {...props} />
);

export const SheetTitle = ({ className = '', ...props }) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`} {...props} />
);

export const SheetDescription = ({ className = '', ...props }) => (
  <p className={`text-sm text-gray-500 ${className}`} {...props} />
);
