// Toaster component - Basic implementation
import React, { useState, useEffect } from 'react';
import { setToastCallback } from './use-toast';

export const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setToastCallback((toast) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    });
  }, []);

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[300px] rounded-lg shadow-lg p-4 ${
            toast.variant === 'destructive' 
              ? 'bg-red-600 text-white' 
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className="font-semibold">{toast.title}</div>
          {toast.description && (
            <div className="text-sm mt-1 opacity-90">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  );
};
