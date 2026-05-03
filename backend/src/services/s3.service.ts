import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import logger from '../utils/logger';

let s3Client: S3Client | null = null;

try {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
      }
    });
    logger.info('☁️ AWS S3 Client configured');
  } else {
    logger.warn('AWS credentials missing, S3 archival disabled.');
  }
} catch (err: any) {
  logger.error(`S3 Setup Error: ${err.message}`);
}

/**
 * Uploads a JSON array of logs to S3 bucket
 * @param {string} companyId - To organize folders in S3
 * @param {Array} logs - Array of log objects
 * @returns {Promise<string | null>} - S3 file key
 */
export const archiveLogsToS3 = async (companyId: string, logs: any[]): Promise<string | null> => {
  if (!s3Client) return null;
  if (!logs || logs.length === 0) return null;

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `company_${companyId}/${timestamp}-logs.json`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'fixflow-logs-storage',
      Key: fileName,
      Body: JSON.stringify(logs, null, 2),
      ContentType: 'application/json'
    });

    await s3Client.send(command);
    logger.info(`📦 Archived ${logs.length} logs to S3: ${fileName}`);
    
    return fileName;
  } catch (err: any) {
    logger.error(`S3 Upload failed: ${err.message}`);
    throw err;
  }
};
