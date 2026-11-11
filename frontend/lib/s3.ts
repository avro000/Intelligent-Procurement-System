import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  endpoint: process.env.AWS_ENDPOINT_URL_S3 || "https://br-falling-meadow-bd10bo1t.storage.c-8.us-east-2.aws.neon.tech",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "nak_live_b7b874b981ae4b3795b901b84f6d6a93",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "nsk_live_078cc87f49818d17f9a6786526a973ec19c96f21ca31a4376e8b0f73af6511af",
  },
  forcePathStyle: true,
});

export async function getPresignedUploadUrl(bucket: string, key: string, contentType: string = "application/pdf"): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getPresignedDownloadUrl(bucket: string, key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
