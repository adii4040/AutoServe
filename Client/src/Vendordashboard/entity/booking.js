// Booking.js

export const Booking = {
  name: "Booking",
  type: "object",
  properties: {
    service_id: {
      type: "string",
      description: "Reference to Service entity",
    },
    service_name: {
      type: "string",
      description: "Service name for display",
    },
    vendor_id: {
      type: "string",
      description: "Reference to Vendor entity",
    },
    vendor_name: {
      type: "string",
      description: "Vendor name for display",
    },
    date: {
      type: "string",
      format: "date",
      description: "Service date",
    },
    time: {
      type: "string",
      description: "Service time",
    },
    status: {
      type: "string",
      enum: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
      description: "Booking status",
    },
    notes: {
      type: "string",
      description: "Additional notes",
    },
    price: {
      type: "number",
      description: "Service price",
    },
  },
  required: ["service_name", "vendor_name", "date", "time", "status"],
};
