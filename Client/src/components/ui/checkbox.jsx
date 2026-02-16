// Checkbox component - Basic implementation
import React from 'react';

export const Checkbox = ({ checked, onCheckedChange, id, className = '' }) => {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
};
