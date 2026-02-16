// Service.js

export const Service = {
  name: "Service",
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Service name",
    },
    description: {
      type: "string",
      description: "Service description",
    },
    category: {
      type: "string",
      enum: [
        "maintenance",
        "repair",
        "inspection",
        "detailing",
        "tire_service",
        "emergency"
      ],
      description: "Service category",
    },
    base_price: {
      type: "number",
      description: "Base price in USD",
    },
    duration_minutes: {
      type: "number",
      description: "Estimated duration in minutes",
    },
    icon: {
      type: "string",
      description: "Icon name for the service",
    },
  },
  required: ["name", "category", "base_price"],
};



