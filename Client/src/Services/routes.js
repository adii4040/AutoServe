/*-------Authentication-----*/


/*------Normal User-------*/
const registerUrl = "/api/v1/user/register"
const loginUrl = "/api/v1/user/login"
const currentUrl = "/api/v1/user/@me"
const logoutUrl = '/api/v1/user/logout'
const resendVerificationUrl = '/api/v1/user/resend-email-verification'
const requestForgotPasswordUrl = '/api/v1/user/request-forgot-password'
const updateUserUrl = (id) => `/api/v1/user/${id}/update`

/*------Bookings-------*/
const myBookingsUrl = '/api/v1/bookings/my-bookings'
const bookingDetailUrl = (id) => `/api/v1/bookings/${id}`
const createBookingUrl = '/api/v1/bookings'










export {
    registerUrl,
    loginUrl,
    currentUrl,
    logoutUrl,
    resendVerificationUrl,
    requestForgotPasswordUrl,
    updateUserUrl,
    myBookingsUrl,
    bookingDetailUrl,
    createBookingUrl,

    // getAllUnVerifiedVendorsDataUrl (removed, not defined)


}