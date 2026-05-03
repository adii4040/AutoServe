import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Vendor } from '../src/Models/vendor.model.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function updateVendorCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        const mappings = [
            { old: 'Car Wash & Detailing', new: 'Car Wash and Detailing' },
            { old: 'Tyre / Wheel', new: 'Tyre Service' },
            { old: 'Mechanical Service', new: 'Mechanical Service' }, // Ensure consistency
        ];

        for (const mapping of mappings) {
            const result = await Vendor.updateMany(
                { serviceCategories: mapping.old },
                { $set: { "serviceCategories.$": mapping.new } }
            );
            console.log(`Updated ${result.modifiedCount} vendors from "${mapping.old}" to "${mapping.new}"`);
        }

        // Global map for any missed ones
        const resultAll = await Vendor.updateMany(
            {},
            [
                {
                    $set: {
                        serviceCategories: {
                            $map: {
                                input: "$serviceCategories",
                                as: "cat",
                                in: {
                                    $switch: {
                                        branches: [
                                            { case: { $eq: ["$$cat", "Car Wash & Detailing"] }, then: "Car Wash and Detailing" },
                                            { case: { $eq: ["$$cat", "Tyre / Wheel"] }, then: "Tyre Service" }
                                        ],
                                        default: "$$cat"
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        );

        console.log(`Total vendor check complete. Modified: ${resultAll.modifiedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

updateVendorCategories();
