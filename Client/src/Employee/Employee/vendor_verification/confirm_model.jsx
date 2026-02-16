import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function ConfirmModal({ 
  open, 
  onOpenChange, 
  action, 
  vendorName, 
  onConfirm,
  isLoading 
}) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) {
      setComment("");
      setError("");
      // Focus the textarea when modal opens
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleConfirm = () => {
    // Require comment for rejection
    if (action === 'reject' && !comment.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    onConfirm(comment.trim());
  };

  const handleKeyDown = (e) => {
    // Submit on Cmd/Ctrl + Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleConfirm();
    }
  };

  const isApprove = action === 'approve';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {isApprove ? (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            )}
            <div>
              <DialogTitle>
                {isApprove ? "Approve Vendor" : "Reject Vendor"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {vendorName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isApprove && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                This vendor will be notified of the rejection. Please provide a clear reason.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              {isApprove ? "Comment (Optional)" : "Reason for Rejection *"}
            </Label>
            <Textarea
              ref={textareaRef}
              id="comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                isApprove
                  ? "Add any notes about this approval..."
                  : "Explain why this vendor is being rejected..."
              }
              className="min-h-[100px] resize-none"
              aria-required={!isApprove}
              aria-invalid={!!error}
              aria-describedby={error ? "comment-error" : undefined}
            />
            {error && (
              <p id="comment-error" className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Press Cmd/Ctrl + Enter to submit
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              isApprove
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                {isApprove ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Approval
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Confirm Rejection
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}