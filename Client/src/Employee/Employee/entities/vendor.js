const VendorSchema = {
  name: "Vendor",
  type: "object",
  properties: {
    vendor_name: {
      type: "string",
      description: "Business name of the vendor",
    },
    owner_name: {
      type: "string",
      description: "Name of the business owner",
    },
    workshop_address: {
      type: "string",
      description: "Physical address of the workshop",
    },
    phone: {
      type: "string",
      description: "Contact phone number",
    },
    email: {
      type: "string",
      description: "Contact email",
    },
    logo_url: {
      type: "string",
      description: "URL to vendor logo image",
    },
    pan_document_url: {
      type: "string",
      description: "URL to uploaded PAN card document",
    },
    aadhar_document_url: {
      type: "string",
      description: "URL to uploaded Aadhar card document",
    },
    verification_visit_images: {
      type: "array",
      description: "Array of image URLs from verification visit",
      items: {
        type: "string",
      },
    },
    services_offered: {
      type: "array",
      description: "List of services offered",
      items: {
        type: "string",
      },
    },
    status: {
      type: "string",
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      description: "Verification status",
    },
    verification_comment: {
      type: "string",
      description: "Admin comment for approval/rejection",
    },
    verified_by: {
      type: "string",
      description: "Email of admin who verified",
    },
    verified_date: {
      type: "string",
      format: "date-time",
      description: "Date when verification was completed",
    },
  },
  required: ["vendor_name", "owner_name", "phone"],
};

export default VendorSchema;
