/**
 * Update vendor availability status
 */
const updateVendorAvailability = async (availablityStatus) => {
    const res = await fetch('/api/v1/vendor/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ availablityStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to update availability');
    }
    return data;
};
import {
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
} from "./routes";
/**
 * Get all bookings for the current vendor
 */

const getVendorOngoingBookings = async () => {
    const res = await fetch(vendorOngoingBookingsUrl, {
        credentials: "include",
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch ongoing bookings")
    }
    return data
}

const getVendorRequestedBookings = async () => {
    const res = await fetch(vendorRequestedBookingsUrl, {
        credentials: "include",
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch requested bookings")
    }
    return data
}

/**
 * Get all bookings for the current vendor (alias for ongoing bookings)
 * Used by useFetchVendorBookings hook
 */
const getVendorBookings = async () => {
    return getVendorOngoingBookings()
}


/**
 * Register vendor with multipart form data
    updateVendorAvailability,
 */
const registerVendor = async (formData) => {
    const res = await fetch(registerVendorUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
    })

    const contentType = res.headers.get("content-type")
    if (!res.ok) {
        const errorData = contentType && contentType.includes("application/json") ? await res.json() : { message: await res.text() }
        // Handle both plain string and object message formats
        const msg = typeof errorData?.message === "object"
            ? errorData.message?.message
            : errorData?.message
        throw new Error(msg || "Vendor Registration Failed")
    }

    return res.json()
}

/**
 * Login vendor with email and password
 */
const loginVendor = async (formData) => {
    const res = await fetch(vendorLoginUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
    })

    const contentType = res.headers.get("content-type")
    if (!res.ok) {
        const errorData = contentType && contentType.includes("application/json") ? await res.json() : { error: await res.text() }
        throw new Error(errorData.message || "Vendor login failed")
    }

    return res.json()
}

const activateVendorAccount = async (formData) => {
    const res = await fetch(vendorActivateAccountUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
    })

    const contentType = res.headers.get("content-type")
    if (!res.ok) {
        const errorData = contentType && contentType.includes("application/json") ? await res.json() : { error: await res.text() }
        throw new Error(errorData?.message || "Failed to activate vendor account")
    }

    return res.json()
}

/**
 * Logout vendor (clear session)
 */
const logoutVendor = async () => {
    const res = await fetch(vendorLogoutUrl, {
        method: "POST",
        credentials: "include",
    })

    const contentType = res.headers.get("content-type")
    if (!res.ok) {
        const errorData = contentType && contentType.includes("application/json") ? await res.json() : { error: await res.text() }
        throw new Error(errorData.message || "Vendor logout failed")
    }

    return res.json()
}

/**
 * Get current authenticated vendor
 */
const getCurrentVendor = async () => {
    const res = await fetch(vendorCurrentUrl, {
        credentials: "include"
    })

    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch current vendor")
    }

    return data
}

/**
 * Update vendor profile
 */
const updateVendorProfile = async (profileData) => {
    const res = await fetch(vendorProfileUrl, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
        credentials: "include",
    })

    const contentType = res.headers.get("content-type")
    if (!res.ok) {
        const errorData = contentType && contentType.includes("application/json") ? await res.json() : { error: await res.text() }
        throw new Error(errorData.message || "Failed to update profile")
    }

    return res.json()
}

const getVendorById = async (vendorId) => {
    const res = await fetch(vendorByIdUrl(vendorId), {
        credentials: "include",
    })

    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch vendor")
    }

    return data
}

const fetchAllUnverifiedVendors = async () => {
    const res = await fetch(getAllUnVerifiedVendorsDataUrl, {
        method: "GET",
        credentials: "include",
    })

    const data = await res.json()
    if (res.status === 404 && data.message === "No Vendor Found.") {
        return { ...data, data: { vendors: [] } }
    }

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch unverified vendors")
    }

    return data
}

const physicalVerifyVendor = async ({ vendorId, status, remark = "" }) => {
    const res = await fetch(vendorPhysicalVerificationUrl(vendorId), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status, remark }),
    })

    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.message || "Vendor verification failed")
    }

    return data
}

/**
 * Accept a booking for the current vendor
 */
const acceptVendorBooking = async (bookingId) => {
    const res = await fetch(`/api/v1/bookings/${bookingId}/accept`, {
        method: "PATCH",
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Failed to accept booking");
    }
    return data;
};

/**
 * Reject a booking for the current vendor
 */
const rejectVendorBooking = async (bookingId) => {
    const res = await fetch(`/api/v1/bookings/${bookingId}/reject`, {
        method: "PATCH",
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Failed to reject booking");
    }
    return data;
};

export {
    registerVendor,
    loginVendor,
    activateVendorAccount,
    logoutVendor,
    getCurrentVendor,
    updateVendorProfile,
    getVendorById,
    fetchAllUnverifiedVendors,
    physicalVerifyVendor,
    getVendorBookings,
    getVendorOngoingBookings,
    getVendorRequestedBookings,
    acceptVendorBooking,
    rejectVendorBooking,
}
