// Toast hook - Basic implementation
import { useState, useCallback } from 'react';

let toastCallback = null;

export const useToast = () => {
  const toast = useCallback(({ title, description, variant = 'default' }) => {
    if (toastCallback) {
      toastCallback({ title, description, variant });
    } else {
      // Fallback to console if no toaster is mounted
      console.log(`Toast: ${title} - ${description}`);
    }
  }, []);

  return { toast };
};

export const toast = ({ title, description, variant = 'default' }) => {
  if (toastCallback) {
    toastCallback({ title, description, variant });
  } else {
    console.log(`Toast: ${title} - ${description}`);
  }
};

export const setToastCallback = (callback) => {
  toastCallback = callback;
};
