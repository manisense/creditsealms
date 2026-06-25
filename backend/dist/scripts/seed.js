"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../src/models/User");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creditsea';
const seedUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected.');
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash('password123', salt);
        const rolesToSeed = [
            { name: 'Admin User', email: 'admin@creditsea.com', role: User_1.Role.Admin },
            { name: 'Sales Exec', email: 'sales@creditsea.com', role: User_1.Role.Sales },
            { name: 'Sanction Exec', email: 'sanction@creditsea.com', role: User_1.Role.Sanction },
            { name: 'Disbursement Exec', email: 'disbursement@creditsea.com', role: User_1.Role.Disbursement },
            { name: 'Collection Exec', email: 'collection@creditsea.com', role: User_1.Role.Collection }
        ];
        for (const u of rolesToSeed) {
            const exists = await User_1.User.findOne({ email: u.email });
            if (!exists) {
                await User_1.User.create({
                    name: u.name,
                    email: u.email,
                    passwordHash,
                    role: u.role
                });
                console.log(`Seeded ${u.role} account: ${u.email}`);
            }
            else {
                console.log(`Account ${u.email} already exists. Skipping.`);
            }
        }
        console.log('Seeding complete.');
    }
    catch (error) {
        console.error('Seeding error:', error);
    }
    finally {
        mongoose_1.default.disconnect();
    }
};
seedUsers();
