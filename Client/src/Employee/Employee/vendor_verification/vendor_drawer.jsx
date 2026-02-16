import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import ImageCarousel from "./image_carousel";
import ConfirmModal from "./confirm_model";

export default function VendorDrawer({ vendor, open, onOpenChange, onVerificationComplete }) {
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' or 'reject'
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: async ({ approved, comment }) => {
      const status = approved ? "APPROVED" : "REJECTED";
      const response = await fetch(`/api/v1/vendor/${vendor._id}/physical-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          remark: comment || ""
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      console.log(response)
      return response.json();
    },
    onMutate: async ({ approved, comment }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["unverified-vendors"] });

      // Snapshot previous value
      const previousVendors = queryClient.getQueryData(["unverified-vendors"]);

      // Optimistically update
      queryClient.setQueryData(["unverified-vendors"], (old) => {
        if (!old?.data?.vendors) return old;
        return {
          ...old,
          data: {
            ...old.data,
            vendors: old.data.vendors.filter((v) => v._id !== vendor._id)
          }
        };
      });

      return { previousVendors };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousVendors) {
        queryClient.setQueryData(["unverified-vendors"], context.previousVendors);
      }
      setError(err.message || "Failed to verify vendor. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unverified-vendors"] });
      if (typeof onVerificationComplete === "function") onVerificationComplete();
    },
  });

  const handleConfirmAction = async (actionComment) => {
    setError(null);
    await verifyMutation.mutateAsync({
      approved: confirmAction === "approve",
      comment: actionComment,
    });
    setConfirmAction(null);
  };

  const openDocument = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // safe date formatting
  const formatDateTime = (dateStr) => {
    try {
      return dateStr ? format(new Date(dateStr), "MMMM d, yyyy 'at' h:mm a") : "-";
    } catch {
      return "-";
    }
  };

  return (
    <>
      <Sheet open={!!open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto"
          aria-describedby="vendor-drawer-description"
        >
          <SheetHeader className="space-y-4">
            <div className="flex items-center gap-4">
              {vendor?.avatar?.url ? (
                <img
                  src={vendor.avatar.url}
                  alt={vendor.shopName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <SheetTitle className="text-xl">{vendor?.shopName || "Vendor"}</SheetTitle>
                <SheetDescription id="vendor-drawer-description">
                  Review vendor details and verification documents
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 space-y-6">
            {/* Vendor Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Vendor Information</h3>

              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Owner Name</div>
                    <div className="text-sm text-gray-900">{vendor?.fullname || "-"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Phone</div>
                    <div className="text-sm text-gray-900">{vendor?.phone || "-"}</div>
                  </div>
                </div>

                {vendor?.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Email</div>
                      <div className="text-sm text-gray-900">{vendor.email}</div>
                    </div>
                  </div>
                )}

                {vendor?.address?.shopAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Workshop Address</div>
                      <div className="text-sm text-gray-900">{vendor.address.shopAddress}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Submitted On</div>
                    <div className="text-sm text-gray-900">{formatDateTime(vendor?.createdAt)}</div>
                  </div>
                </div>

                {vendor?.services_offered && vendor.services_offered.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Services Offered</div>
                      <div className="flex flex-wrap gap-2">
                        {vendor.services_offered.map((service, idx) => (
                          <Badge key={idx} variant="secondary">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Verification Visit Images */}
            {vendor?.verification_visit_images && vendor.verification_visit_images.length > 0 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-700" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Verification Visit Photos</h3>
                    <Badge variant="outline">{vendor.verification_visit_images.length}</Badge>
                  </div>
                  <ImageCarousel images={vendor.verification_visit_images} />
                </div>
                <Separator />
              </>
            )}

            {/* Documents */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-700" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Verification Documents</h3>
              </div>

              <div className="grid gap-3">
                {vendor?.documents?.panCard?.url && (
                  <div
                    onClick={() => openDocument(vendor.documents.panCard.url)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDocument(vendor.documents.panCard.url);
                      }
                    }}
                    aria-label="View PAN document"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">PAN Card</div>
                        <div className="text-xs text-gray-500">Click to view</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                )}

                {vendor?.documents?.aadhaarCard?.url && (
                  <div
                    onClick={() => openDocument(vendor.documents.aadhaarCard.url)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDocument(vendor.documents.aadhaarCard.url);
                      }
                    }}
                    aria-label="View Aadhar document"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Aadhar Card</div>
                        <div className="text-xs text-gray-500">Click to view</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                )}

                {!vendor?.documents?.panCard?.url && !vendor?.documents?.aadhaarCard?.url && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No documents uploaded</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white pt-4 pb-2 space-y-3">
              <Button
                onClick={() => setConfirmAction("approve")}
                disabled={verifyMutation.isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                aria-label="Approve vendor"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Vendor
              </Button>
              <Button
                onClick={() => setConfirmAction("reject")}
                disabled={verifyMutation.isLoading}
                variant="destructive"
                className="w-full"
                aria-label="Reject vendor"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Vendor
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={!!confirmAction}
        onOpenChange={(openState) => !openState && setConfirmAction(null)}
        action={confirmAction}
        vendorName={vendor?.shopName}
        onConfirm={handleConfirmAction}
        isLoading={verifyMutation.isLoading}
      />
    </>
  );
}
