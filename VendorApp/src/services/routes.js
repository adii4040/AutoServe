// API Routes - Vendor Portal
const registerVendorUrl = "/api/v1/vendor/register"
const vendorLoginUrl = "/api/v1/vendor/login"
const vendorActivateAccountUrl = "/api/v1/vendor/activate-account"
const vendorLogoutUrl = "/api/v1/vendor/logout"
const vendorCurrentUrl = "/api/v1/vendor/@me"
const vendorProfileUrl = "/api/v1/vendor/profile"
const vendorOngoingBookingsUrl = "/api/v1/bookings/vendor/my-bookings"
const vendorRequestedBookingsUrl = "/api/v1/bookings/vendor/requested-bookings"
const getAllUnVerifiedVendorsDataUrl = "/api/v1/vendor/get-unverified-vendors"

const vendorByIdUrl = (vendorId) => `/api/v1/vendor/${vendorId}/@me`
const vendorPhysicalVerificationUrl = (vendorId) => `/api/v1/vendor/${vendorId}/physical-verification`
const vendorAcceptBookingUrl = (bookingId) => `/api/v1/bookings/${bookingId}/accept`
const vendorRejectBookingUrl = (bookingId) => `/api/v1/bookings/${bookingId}/reject`

export {
    registerVendorUrl,
    vendorLoginUrl,
    vendorActivateAccountUrl,
    vendorLogoutUrl,
    vendorCurrentUrl,
    vendorProfileUrl,
    vendorOngoingBookingsUrl,
    vendorRequestedBookingsUrl,
    getAllUnVerifiedVendorsDataUrl,
    vendorByIdUrl,
    vendorPhysicalVerificationUrl,
    vendorAcceptBookingUrl,
    vendorRejectBookingUrl,
}
