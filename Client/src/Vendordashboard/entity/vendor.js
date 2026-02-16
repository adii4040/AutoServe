// Vendor.js

export const Vendor = {
  name: "Vendor",
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Vendor name",
    },
    address: {
      type: "string",
      description: "Vendor address",
    },
    phone: {
      type: "string",
      description: "Contact phone",
    },
    rating: {
      type: "number",
      description: "Average rating out of 5",
    },
    specialties: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Service specialties",
    },
    available_slots: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Available time slots",
    },
  },
  required: ["name", "rating"],
};
