"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const loan_controller_1 = require("../controllers/loan.controller");
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// Multer config: memory storage, max 5MB, PDF/JPG/PNG only
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
        }
        cb(null, true);
    }
});
// All loan routes require authentication and Borrower role
router.use(auth_1.authenticate);
router.use((0, auth_1.requireRole)([User_1.Role.Borrower]));
router.post('/apply', upload.single('salarySlip'), loan_controller_1.applyForLoan);
router.get('/my-loans', loan_controller_1.getMyLoans);
exports.default = router;
