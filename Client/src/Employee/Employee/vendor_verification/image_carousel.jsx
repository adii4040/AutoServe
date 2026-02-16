import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export default function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);

  if (!images || images.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div
          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Image carousel"
        >
          <img
            src={images[currentIndex]}
            alt={`Verification photo ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />

          {/* Zoom Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setZoomedImage(images[currentIndex])}
            aria-label="Zoom image"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToPrevious}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToNext}
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                  index === currentIndex ? "ring-2 ring-blue-500 ring-offset-2" : "opacity-60 hover:opacity-100"
                }`}
                aria-label={`View image ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoomed Image Dialog */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Verification Photo {currentIndex + 1}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={zoomedImage}
              alt={`Zoomed verification photo ${currentIndex + 1}`}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
