import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

const DialogContext = React.createContext({ open: false, onOpenChange: () => {} })

const Dialog = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <div className="dialog-root">
        {children}
      </div>
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ children, onClick, asChild, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick })
  }
  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}

const DialogPortal = ({ children }) => {
  return createPortal(children, document.body)
}

const DialogOverlay = React.forwardRef(({ className, onClick, ...props }, ref) => (
  <div
    ref={ref}
    className={`fixed inset-0 z-50 bg-black/80 animate-in fade-in-0 ${className || ''}`}
    onClick={onClick}
    {...props}
  />
))
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef(({ className, children, onClose, onOpenAutoFocus, onCloseAutoFocus, onEscapeKeyDown, onPointerDownOutside, onInteractOutside, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext)
  const handleClose = onClose || (() => onOpenChange?.(false))

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleClose])

  return (
    <DialogPortal>
      <DialogOverlay onClick={handleClose} />
      <div
        ref={ref}
        className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-[48%] rounded-lg ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </DialogPortal>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 ${className || ''}`}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

const DialogClose = ({ children, onClick, asChild, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick })
  }
  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
