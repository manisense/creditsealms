"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToR2 = exports.s3Client = exports.isR2Configured = exports.R2_BUCKET_NAME = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
exports.R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
// If credentials are not set, we bypass S3 for local testing/fallback
exports.isR2Configured = Boolean(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_ENDPOINT && exports.R2_BUCKET_NAME);
exports.s3Client = exports.isR2Configured ? new client_s3_1.S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
}) : null;
const uploadFileToR2 = async (fileBuffer, originalName, mimeType) => {
    if (!exports.isR2Configured || !exports.s3Client) {
        console.warn('R2 is not configured. Returning fallback local URL.');
        return `/uploads/fallback-${originalName}`;
    }
    const extension = originalName.split('.').pop();
    const fileName = `${(0, uuid_1.v4)()}.${extension}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: exports.R2_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
    });
    await exports.s3Client.send(command);
    // Return the raw R2 URL using the endpoint domain. 
    // For production, users typically set up a custom pub.dev domain in Cloudflare Dashboard.
    const baseUrl = R2_ENDPOINT.replace('https://', '');
    return `https://${exports.R2_BUCKET_NAME}.${baseUrl}/${fileName}`;
};
exports.uploadFileToR2 = uploadFileToR2;
