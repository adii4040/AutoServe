import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkBooking() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
        const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));

        const bookingId = '69f767b740a7b50ca0b98e30';
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            console.log('Booking not found');
            process.exit(0);
        }

        console.log('Booking Data:', JSON.stringify(booking, null, 2));

        if (booking.vendorId) {
            const vendor = await Vendor.findById(booking.vendorId);
            console.log('Vendor Data:', JSON.stringify(vendor, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkBooking();
