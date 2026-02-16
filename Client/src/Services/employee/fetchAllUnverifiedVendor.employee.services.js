import { getAllUnVerifiedVendorsDataUrl } from '../routes'

/*----Fetch All Unverified Vendors list---*/
const fetchAllUnverifiedVendors = async () => {
    const res = await fetch(getAllUnVerifiedVendorsDataUrl, {
        method: 'GET',
        credentials: "include"
    })
    const data = await res.json()
    
    // If 404 with "No Vendor Found", return empty data instead of throwing
    if (res.status === 404 && data.message === "No Vendor Found.") {
        return { ...data, data: { vendors: [] } };
    }
    
    if (!res.ok) {
        throw new Error(data.message);
    }
    console.log(data)
    return data;
}

export {
    fetchAllUnverifiedVendors
}