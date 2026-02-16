/*-------Authentication-----*/


/*------Normal User-------*/
const registerUrl = "/api/v1/user/register"
const loginUrl = "/api/v1/user/login"
const currentUrl = "/api/v1/user/@me"
const logoutUrl = '/api/v1/user/logout'
const resendVerificationUrl = '/api/v1/user/resend-email-verification'
const requestForgotPasswordUrl = '/api/v1/user/request-forgot-password'
const updateUserUrl = (id) => `/api/v1/user/${id}/update`


/*-----Vendor------*/

const registerVendorUrl = "/api/v1/vendor/register"
const getAllUnVerifiedVendorsDataUrl = "/api/v1/vendor/get-unverified-vendors"
//const physicalVerificationUrl = "/api/v1/vendor/:vendorId/physical-verification"







export {
    registerUrl,
    loginUrl,
    currentUrl,
    logoutUrl,
    resendVerificationUrl,
    requestForgotPasswordUrl,
    updateUserUrl,


    registerVendorUrl,
    getAllUnVerifiedVendorsDataUrl


}