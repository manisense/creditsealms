import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';

// If credentials are not set, we bypass S3 for local testing/fallback
export const isR2Configured = Boolean(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_ENDPOINT && R2_BUCKET_NAME);

export const s3Client = isR2Configured ? new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
}) : null;

export const uploadFileToR2 = async (fileBuffer: Buffer, originalName: string, mimeType: string): Promise<string> => {
  if (!isR2Configured || !s3Client) {
    console.warn('R2 is not configured. Returning fallback local URL.');
    return `/uploads/fallback-${originalName}`;
  }

  const extension = originalName.split('.').pop();
  const fileName = `${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Return the raw R2 URL using the endpoint domain. 
  // For production, users typically set up a custom pub.dev domain in Cloudflare Dashboard.
  const baseUrl = R2_ENDPOINT.replace('https://', '');
  return `https://${R2_BUCKET_NAME}.${baseUrl}/${fileName}`;
};
