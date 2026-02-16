import { registerVendorUrl } from "../routes"

/*----Register Vendor Service---*/
const registerVendor = async (formData) => {
    const res = await fetch(registerVendorUrl, {
        method: 'POST',
        body: formData,
        credentials: "include"
    })

    const contentType = res.headers.get("content-type")
    if (!res.ok) {
        const errorData = contentType && contentType.includes('application/json') ? await res.json() : { error: await res.text() }
        
        console.error('❌ Backend error:', errorData.message || errorData.error || 'Unknown error')
        throw new Error(errorData.message.message || "Vendor Registration Failed")
    }

    const data = await res.json()
    return data
}


const getCurrentVendor = async ({ vendorId }) => {
    const res = await fetch(`/api/v1/vendor/${vendorId}/@me`, {
        credentials: "include"
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
}

// Fetch vendor by ID for refreshing vendor data
const getVendorById = async (vendorId) => {
    const res = await fetch(`/api/v1/vendor/${vendorId}`, {
        credentials: "include"
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
}

export {
    registerVendor,
    getCurrentVendor,
    getVendorById
}

