/**
 * Cloudflare R2 Storage Service  (free S3-compatible object storage)
 *
 * Free tier — forever:
 *   10 GB storage · 1M writes/month · 10M reads/month · Zero egress fees
 *
 * Required env vars (backend/.env + Vercel project env):
 *   R2_ACCOUNT_ID        — Cloudflare account ID (dashboard sidebar)
 *   R2_ACCESS_KEY_ID     — R2 API token Access Key ID
 *   R2_SECRET_ACCESS_KEY — R2 API token Secret Access Key
 *   R2_BUCKET_NAME       — Name of your R2 bucket
 *   R2_PUBLIC_URL        — Public bucket URL e.g. https://pub-xxx.r2.dev (optional)
 *
 * Setup (5 minutes):
 *   1. https://dash.cloudflare.com → R2 → Create bucket
 *   2. R2 → Manage R2 API Tokens → Create token (Object Read & Write)
 *   3. Copy Account ID, Access Key ID, Secret Access Key into .env
 *   4. In your bucket → Settings → Public access → Enable (for public URLs)
 *
 * Falls back to disk storage (/tmp on Vercel, uploads/ in dev) when vars are absent.
 */

const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');

let _client = null;

const isConfigured = () =>
    !!(
        process.env.R2_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME
    );

const getClient = () => {
    if (!isConfigured()) return null;
    if (_client) return _client;
    _client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });
    return _client;
};

const getBucketName = () => process.env.R2_BUCKET_NAME || '';

/** Build a public URL for a stored object key. Returns null if R2_PUBLIC_URL is not set. */
const getPublicUrl = (key) => {
    const base = process.env.R2_PUBLIC_URL;
    if (!base || !key) return null;
    return `${base.replace(/\/$/, '')}/${key}`;
};

/**
 * Upload a Buffer or Readable stream to R2.
 * @param {Buffer|Readable} body
 * @param {string} key          e.g. 'uploads/materials/1234-file.pdf'
 * @param {string} contentType
 * @returns {{ url: string|null, key: string } | null}  null when R2 not configured
 */
const uploadBuffer = async (body, key, contentType = 'application/octet-stream') => {
    const client = getClient();
    if (!client) return null;
    const upload = new Upload({
        client,
        params: { Bucket: getBucketName(), Key: key, Body: body, ContentType: contentType },
    });
    await upload.done();
    return { url: getPublicUrl(key), key };
};

/** Delete an object from R2 by its key. */
const deleteFile = async (key) => {
    const client = getClient();
    if (!client || !key) return;
    try {
        await client.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }));
    } catch (err) {
        console.error('[R2] Delete failed:', err.message);
    }
};

/**
 * Returns a multer-s3 storage engine pointed at R2, or null to fall back to disk.
 * @param {string} keyPrefix  e.g. 'uploads/materials'
 */
const getR2Storage = (keyPrefix = 'uploads') => {
    if (!isConfigured()) return null;
    try {
        const multerS3 = require('multer-s3');
        const client = getClient();
        if (!client) return null;
        return multerS3({
            s3: client,
            bucket: getBucketName(),
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const ext = path.extname(file.originalname);
                cb(null, `${keyPrefix}/${uniqueSuffix}${ext}`);
            },
        });
    } catch (err) {
        console.warn('[R2] multer-s3 unavailable — falling back to disk storage:', err.message);
        return null;
    }
};

// Backward-compatible alias for any code that still imports getCloudinaryStorage
const getCloudinaryStorage = getR2Storage;

module.exports = { isConfigured, uploadBuffer, deleteFile, getPublicUrl, getR2Storage, getCloudinaryStorage };
